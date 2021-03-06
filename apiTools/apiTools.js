const { Pit: { Upgrades, RenownUpgrades, Perks, Mystics }, Extra: { ColorCodes: Colors } } = require('../frontEnd/src/pitMaster.json');
const mcitems = require('../minecraftItems.json');

const TextHelpers = require('../utils/TextHelpers');
const textHelpers = new TextHelpers();

/**
 * Generates a function to send to router to display a given error message
 * @param {string} message Error message
 * @returns {Function}
 */
function APIerror(message) {
    const json = { success: false, error: message };
    const errorFn = ((req, res) => res.status(404).json(json));
    errorFn.toString = () => { error: message };
    errorFn.json = json;
    return errorFn;
}

/**
 * Gets properties for an object and returns undefined if
 * it does not exist instead of erroring
 * @param {Object} object object to grab property from
 * @param  {...string} path path to get
 * @returns the value at the path from the object
 */
const getRef = (object, ...path) => {
    if (!object) return undefined;
    if (path.length == 1) return object[path[0]];
    else return getRef(object[path.shift()], ...path)
}

/**
 * 
 * @param {string | object} target key or upgrade object to check
 */
const isTiered = target => {
    if (typeof target === 'string') target = Upgrades[target] || RenownUpgrades[target] || Perks[target];
    return (
        (target.Levels || []).length > 1 ||
        getRef(target, 'Extra', 'Formatting') == "Seperated" ||
        getRef(target, 'Extra', 'Formatting') == "Reveal"
    )
}

/**
 * takes item id and meta and returns it item name
 * @param {number} id 
 * @param {number} meta 
 * @returns {string}
 */
const getItemNameFromId = (id, meta) => {
    const firstcheck = mcitems.filter(item => item.type == id);
    if (firstcheck.length == 0) return;
    const secondcheck = firstcheck.find(item => item.meta == meta);
    return (secondcheck || firstcheck[0]).name;
}

const Item = require('../structures/Item');
/**
 * converts document to item
 * @param {Document} doc 
 * @returns {{owner:String,lastseen:Number,item:Item,id:string}}
 */
const dbToItem = doc => {
    return {
        owner: doc.owner,
        lastseen: Math.floor(doc.lastseen / 1e3),
        id: doc._id,
        item: new Item(
            doc.item.name,
            [`${Colors.GRAY}Lives: ${doc.lives > 3 ? Colors.GREEN : Colors.RED}${doc.lives}${Colors.GRAY}/${doc.maxLives}`, ...doc.enchants.map(({ key, level }) => [
                '',
                Mystics[key].Name + ' ' + ((level > 1) ? textHelpers.romanNumGen(level) : ''),
                ...Mystics[key].Descriptions[Math.min(level - 1, Mystics[key].Descriptions.length - 1)]
            ]).flat(1)],
            doc.item.id,
            (typeof doc.item.meta !== 'undefined') ? textHelpers.toHex(doc.item.meta) : undefined,
            1
        )
    };
}

module.exports = { dbToItem, getItemNameFromId, isTiered, APIerror, getRef };