const { Arm, Bow, Sword, Knife, Staff, LongBow, Axe, StormStaff } = require('./weapon');

class Player {
    constructor(position, name) {
        this.life = 100;
        this.magic = 20;
        this.speed = 1;
        this.attack = 10;
        this.agility = 5;
        this.luck = 10;
        this.description = 'Игрок';
        this.weapon = new Arm();
        this.position = position;
        this.name = name;
    }

    // Коэффициент удачи: случайное число от 0 до 100 плюс удача, делённое на 100
    getLuck() {
        const randomNumber = Math.random() * 100;
        return (randomNumber + this.luck) / 100;
    }

    getDamage(distance) {
        if (distance > this.weapon.range) return 0;
        const weaponDamage = this.weapon.getDamage();
        return (this.attack + weaponDamage) * this.getLuck() / distance;
    }

    takeDamage(damage) {
        this.life = Math.max(0, this.life - damage);
    }

    isDead() {
        return this.life === 0;
    }

    moveLeft(distance) {
        const step = Math.min(distance, this.speed);
        this.position -= step;
    }

    moveRight(distance) {
        const step = Math.min(distance, this.speed);
        this.position += step;
    }

    move(distance) {
        if (distance < 0) {
            this.moveLeft(Math.abs(distance));
        } else {
            this.moveRight(distance);
        }
    }

    // Возвращает true, если удар был заблокирован щитом/парированием
    isAttackBlocked() {
        return this.getLuck() > (100 - this.luck) / 100;
    }

    // Возвращает true, если игрок уклонился от удара
    dodged() {
        return this.getLuck() > (100 - this.agility - this.speed * 3) / 100;
    }

    // Принимает удар с учётом блока и уклонения
    takeAttack(damage) {
        if (this.isAttackBlocked()) {
            this.weapon.takeDamage(damage);
            console.log(`${this.name} блокирует удар оружием!`);
            return;
        }
        if (this.dodged()) {
            console.log(`${this.name} уклоняется от удара!`);
            return;
        }
        this.takeDamage(damage);
    }

    // Проверяет состояние оружия и при необходимости заменяет его
    checkWeapon() {
        if (this.weapon.isBroken()) {
            this.weapon = this._nextWeapon();
            console.log(`${this.name} меняет оружие на ${this.weapon.name}`);
        }
    }

    // Переопределяется в подклассах — возвращает следующее оружие в цепочке
    _nextWeapon() {
        return new Arm();
    }

    tryAttack(enemy) {
        const distance = Math.abs(this.position - enemy.position);

        if (this.weapon.range < distance) {
            console.log(`${this.name} не достаёт до ${enemy.name}`);
            return;
        }

        const wearDamage = 10 * this.getLuck();
        this.weapon.takeDamage(wearDamage);
        this.checkWeapon();

        const damage = this.getDamage(distance || 1);

        if (this.position === enemy.position) {
            // Противник отлетает вправо и получает двойной урон
            enemy.position += 1;
            enemy.takeAttack(damage * 2);
            console.log(`${this.name} наносит двойной удар по ${enemy.name}! Тот отлетает на позицию ${enemy.position}`);
        } else {
            enemy.takeAttack(damage);
        }
    }

    // Выбирает врага с минимальным здоровьем среди живых игроков (кроме себя)
    chooseEnemy(players) {
        const enemies = players.filter(p => p !== this && !p.isDead());
        if (enemies.length === 0) return null;
        return enemies.reduce((min, p) => p.life < min.life ? p : min, enemies[0]);
    }

    // Движение в сторону врага на одну клетку
    moveToEnemy(enemy) {
        if (enemy.position > this.position) {
            this.moveRight(this.speed);
        } else if (enemy.position < this.position) {
            this.moveLeft(this.speed);
        }
    }

    turn(players) {
        const enemy = this.chooseEnemy(players);
        if (!enemy) return;
        this.moveToEnemy(enemy);
        this.tryAttack(enemy);
    }
}

class Warrior extends Player {
    constructor(position, name) {
        super(position, name);
        this.life = 120;
        this.speed = 2;
        this.attack = 10;
        this.description = 'Воин';
        this.weapon = new Sword();
        this._weaponChain = ['sword', 'knife', 'arm'];
        this._weaponIndex = 0;
    }

    // При здоровье < 50% и удаче > 0.8 урон поглощается маной
    takeDamage(damage) {
        const halfLife = 120 / 2;
        if (this.life < halfLife && this.getLuck() > 0.8 && this.magic > 0) {
            const absorbed = Math.min(damage, this.magic);
            this.magic -= absorbed;
            const remaining = damage - absorbed;
            if (remaining > 0) {
                this.life = Math.max(0, this.life - remaining);
            }
            return;
        }
        this.life = Math.max(0, this.life - damage);
    }

    _nextWeapon() {
        this._weaponIndex++;
        if (this._weaponIndex === 1) return new Knife();
        return new Arm();
    }
}

class Archer extends Player {
    constructor(position, name) {
        super(position, name);
        this.life = 80;
        this.magic = 35;
        this.attack = 5;
        this.agility = 10;
        this.description = 'Лучник';
        this.weapon = new Bow();
        this._weaponIndex = 0;
    }

    // Урон зависит от расстояния и дальности оружия
    getDamage(distance) {
        if (distance > this.weapon.range) return 0;
        const weaponDamage = this.weapon.getDamage();
        return (this.attack + weaponDamage) * this.getLuck() * distance / this.weapon.range;
    }

    _nextWeapon() {
        this._weaponIndex++;
        if (this._weaponIndex === 1) return new Knife();
        return new Arm();
    }
}

class Mage extends Player {
    constructor(position, name) {
        super(position, name);
        this.life = 70;
        this.magic = 100;
        this.attack = 5;
        this.agility = 8;
        this.description = 'Маг';
        this.weapon = new Staff();
        this._weaponIndex = 0;
    }

    // При мане > 50% урон вдвое меньше, мана уменьшается на 12
    takeDamage(damage) {
        const halfMana = 100 / 2;
        if (this.magic > halfMana) {
            this.magic -= 12;
            this.life = Math.max(0, this.life - Math.floor(damage / 2));
            return;
        }
        this.life = Math.max(0, this.life - damage);
    }

    _nextWeapon() {
        this._weaponIndex++;
        if (this._weaponIndex === 1) return new Knife();
        return new Arm();
    }
}

class Dwarf extends Warrior {
    constructor(position, name) {
        super(position, name);
        this.life = 130;
        this.attack = 15;
        this.luck = 20;
        this.description = 'Гном';
        this.weapon = new Axe();
        this._weaponIndex = 0;
        this._hitCount = 0;
    }

    // Каждый шестой удар наносит вдвое меньше урона при удаче > 0.5
    takeDamage(damage) {
        this._hitCount++;
        if (this._hitCount % 6 === 0 && this.getLuck() > 0.5) {
            console.log(`${this.name} использует защиту гнома — урон уменьшен вдвое!`);
            super.takeDamage(Math.floor(damage / 2));
            return;
        }
        super.takeDamage(damage);
    }

    _nextWeapon() {
        this._weaponIndex++;
        if (this._weaponIndex === 1) return new Knife();
        return new Arm();
    }
}

class Crossbowman extends Archer {
    constructor(position, name) {
        super(position, name);
        this.life = 85;
        this.attack = 8;
        this.agility = 20;
        this.luck = 15;
        this.description = 'Арбалетчик';
        this.weapon = new LongBow();
        this._weaponIndex = 0;
    }

    _nextWeapon() {
        this._weaponIndex++;
        if (this._weaponIndex === 1) return new Knife();
        return new Arm();
    }
}

class Demiurge extends Mage {
    constructor(position, name) {
        super(position, name);
        this.life = 80;
        this.magic = 120;
        this.attack = 6;
        this.luck = 12;
        this.description = 'Демиург';
        this.weapon = new StormStaff();
        this._weaponIndex = 0;
    }

    // При мане > 0 и удаче > 0.6 урон в 1.5 раза выше
    getDamage(distance) {
        const base = super.getDamage(distance);
        if (this.magic > 0 && this.getLuck() > 0.6) {
            return base * 1.5;
        }
        return base;
    }

    _nextWeapon() {
        this._weaponIndex++;
        if (this._weaponIndex === 1) return new Knife();
        return new Arm();
    }
}

module.exports = { Player, Warrior, Archer, Mage, Dwarf, Crossbowman, Demiurge };
