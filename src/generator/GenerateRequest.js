'use strict';

/**
 * @typedef {{
 *   name: string
 *   type: 'string'|'number'|'date'|'buffer'|'boolean'|'array'|'objectId'
 *   example?: string|number|boolean
 *   readonly: boolean  // should be in validator
 *   required: boolean  // requiredIfPresent in validator
 *   fulltext: boolean
 *   sortable: boolean
 * }} PropertyDefinition
 */

class GenerateRequest {

    /**
     * @returns {string}
     */
    get namePlural () {

        if (/y$/.test(this.name)) { // category -> categories
            return `${this.name.substr(0, this.name.length - 1)}ies`;
        }

        return `${this.name}s`; // product -> products
    }

    /**
     * @returns {string}
     */
    get Name () {
        return `${this.name[0].toUpperCase()}${this.name.substr(1)}`;
    }

    /**
     * @returns {string}
     */
    get NamePlural () {
        return `${this.namePlural[0].toUpperCase()}${this.namePlural.substr(1)}`;
    }

    /**
     * @returns {PropertyDefinition}
     */
    get id () {
        return this._properties.get('id');
    }

    /**
     * @returns {PropertyDefinition[]} - properties without the id property
     */
    get properties () {
        return [...this._properties.values()]
            .filter(prop => prop.name !== 'id');
    }

    /**
     * @returns {PropertyDefinition[]}
     */
    get requiredProperties () {
        return this.properties.filter(prop => prop.required);
    }

    /**
     * @returns {PropertyDefinition[]}
     */
    get fulltextProperties () {
        return [...this._properties.values()]
            .filter(prop => prop.fulltext);
    }

    /**
     * @returns {PropertyDefinition[]}
     */
    get editableProperties () {
        return [...this._properties.values()]
            .filter(prop => !prop.readonly);
    }

    /**
     * @returns {PropertyDefinition[]}
     */
    get sortableProperties () {
        return [...this._properties.values()]
            .filter(prop => prop.sortable);
    }

    /**
     * @param {string} name - the model name
     */
    constructor (name) {

        this.name = name;

        this._properties = new Map();

        ['get', 'getAll', 'create', 'update', 'delete'].forEach((method) => {
            this[method] = false;
        });
    }

    /**
     * @param {string} name
     * @returns {boolean}
     */
    hasProperty (name) {
        return this._properties.has(name);
    }

    /**
     * @param {PropertyDefinition} property
     */
    addProperty (property) {
        this._properties.set(property.name, Object.assign({

            /**
             * @returns {string}
             */
            get Name () {
                return `${this.name[0].toUpperCase()}${this.name.substr(1)}`;
            },

            /**
             * @returns {string}
             */
            get dbName () {
                return this.name === 'id' ? '_id' : this.name;
            },

            /**
             * @returns {string}
             */
            get Classname () {
                switch (this.type) {
                    case 'string': return 'String';
                    case 'number': return 'Number';
                    case 'date': return 'Date';
                    case 'Buffer': return 'Buffer';
                    case 'boolean': return 'Boolean';
                    case 'array': return 'Array';
                    case 'objectId': return 'mongodb.ObjectId';
                    default:
                        throw new Error(`Undefined property type '${this.type}'.`);
                }
            }

        }, property));
    }

    /**
     * @param {'get'|'getAll'|'create'|'update'|'delete'} name
     */
    addMethod (name) {
        this[name] = true;
    }

}

module.exports = GenerateRequest;
