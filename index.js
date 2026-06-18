const { Warrior, Archer, Mage, Dwarf, Crossbowman, Demiurge } = require('./player');
const { play } = require('./battle');

const warrior = new Warrior(0, 'Алёша Попович');
const archer = new Archer(10, 'Леголас');
const mage = new Mage(5, 'Гендальф');
const dwarf = new Dwarf(2, 'Гимли');
const crossbowman = new Crossbowman(8, 'Уилл Тёрнер');
const demiurge = new Demiurge(4, 'Радагаст');

play([warrior, archer, mage, dwarf, crossbowman, demiurge]);
