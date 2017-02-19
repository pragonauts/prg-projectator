'use strict';

// TODO fix next line!
const protagonist = require('protagonist'); // eslint-disable-line
const GenerateRequest = require('./GenerateRequest');
const _ = require('lodash');

/**
 * @param {string} blueprint - the API Blueprint as plain text
 * @param {string} resourceName - the model name
 * @returns {GenerateRequest}
 */
module.exports = (blueprint, resourceName) => {

    const generateRequest = new GenerateRequest(resourceName);
    const blueprintAST = protagonist.parseSync(blueprint, { type: 'ast' }).ast;

    const allResources = _.flatten(blueprintAST.resourceGroups.map(group => group.resources));
    const singleResource = _.find(
        allResources,
        resource => resource.name.toLowerCase() === resourceName.toLowerCase()
    );

    if (!singleResource) {
        console.error(`The resource ${resourceName} not found`);
        process.exit(1);
    }

    const collectionResourceUriTemplate = singleResource.uriTemplate.replace(/\/{[a-z0-9]+}$/i, '').toLowerCase();
    const collectionResource = _.find(
        allResources,
        r => r.uriTemplate.toLowerCase() === collectionResourceUriTemplate
    );

    const findActionInResource = (resource, method) => _.find(resource.actions, { method });

    const getAction = findActionInResource(singleResource, 'GET');
    const updateAction = findActionInResource(singleResource, 'PUT');
    const deleteAction = findActionInResource(singleResource, 'DELETE');
    const getAllAction = findActionInResource(collectionResource, 'GET');
    const createAction = findActionInResource(collectionResource, 'POST');

    if (getAction) {
        generateRequest.addMethod('get');
    }

    if (updateAction) {
        generateRequest.addMethod('update');
    }

    if (deleteAction) {
        generateRequest.addMethod('delete');
    }

    if (getAllAction) {
        generateRequest.addMethod('getAll');
    }

    if (createAction) {
        generateRequest.addMethod('create');
    }

    // iterate request properties and add to the generateRequest
    const singleExampleRequest = (createAction || updateAction).examples[0].requests[0];
    singleExampleRequest.content[0].content[0].content.forEach((property, i) => {
        const name = property.content.key.content;
        const type = property.content.value.element;
        const example = property.content.value.content;
        const typeAttributes = _.get(property, 'attributes.typeAttributes', []);
        generateRequest.addProperty({
            name,
            type,
            readOnly: false,
            required: typeAttributes.includes('required'),
            sortable: i === 0,
            fulltext: i === 0,
            example
        });
    });

    // iterate response properties and add the missing ones to the generateRequest
    const singleExampleResponse = (createAction || updateAction || getAction)
        .examples[0].responses[0];

    const response = JSON.parse(singleExampleResponse.body);
    Object.keys(response).forEach((propertyName) => {
        if (!generateRequest.hasProperty(propertyName)) {
            generateRequest.addProperty({
                name: propertyName,
                type: typeof response[propertyName],
                readonly: true,
                required: false,
                sortable: propertyName === 'id',
                fulltext: false,
                example: response[propertyName]
            });
        }
    });

    return generateRequest;
};
