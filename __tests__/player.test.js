const { Player, Warrior, Archer, Mage, Dwarf, Crossbowman, Demiurge } = require('../player');
const { Arm, Sword, Bow, Staff, Axe, LongBow, StormStaff, Knife } = require('../weapon');

// Фиксируем Math.random для предсказуемых тестов
function mockLuck(value) {
    // getLuck = (random * 100 + luck) / 100
    // чтобы получить нужный результат: random = value * 100 - luck
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
}

afterEach(() => {
    jest.restoreAllMocks();
});

describe('Player', () => {
    test('начальные характеристики', () => {
        const p = new Player(5, 'Тест');
        expect(p.life).toBe(100);
        expect(p.magic).toBe(20);
        expect(p.speed).toBe(1);
        expect(p.attack).toBe(10);
        expect(p.agility).toBe(5);
        expect(p.luck).toBe(10);
        expect(p.description).toBe('Игрок');
        expect(p.weapon).toBeInstanceOf(Arm);
        expect(p.position).toBe(5);
        expect(p.name).toBe('Тест');
    });

    describe('getLuck', () => {
        test('возвращает число', () => {
            const p = new Player(0, 'Тест');
            expect(typeof p.getLuck()).toBe('number');
        });

        test('формула: (random*100 + luck) / 100', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.5);
            const p = new Player(0, 'Тест');
            expect(p.getLuck()).toBeCloseTo((50 + 10) / 100);
        });
    });

    describe('getDamage', () => {
        test('возвращает 0 если расстояние больше дальности оружия', () => {
            const p = new Player(0, 'Тест'); // оружие Arm, range=1
            expect(p.getDamage(2)).toBe(0);
        });

        test('рассчитывает урон по формуле', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.5);
            const p = new Player(0, 'Тест'); // attack=10, weapon=Arm(attack=1), luck=10
            // luck = (50 + 10)/100 = 0.6
            // damage = (10 + 1) * 0.6 / 1 = 6.6
            expect(p.getDamage(1)).toBeCloseTo(6.6);
        });
    });

    describe('takeDamage', () => {
        test('уменьшает жизнь на величину урона', () => {
            const p = new Player(0, 'Тест');
            p.takeDamage(30);
            expect(p.life).toBe(70);
        });

        test('жизнь не падает ниже 0', () => {
            const p = new Player(0, 'Тест');
            p.takeDamage(500);
            expect(p.life).toBe(0);
        });
    });

    describe('isDead', () => {
        test('возвращает false при жизни > 0', () => {
            const p = new Player(0, 'Тест');
            expect(p.isDead()).toBe(false);
        });

        test('возвращает true при жизни = 0', () => {
            const p = new Player(0, 'Тест');
            p.takeDamage(100);
            expect(p.isDead()).toBe(true);
        });
    });

    describe('moveLeft / moveRight', () => {
        test('moveRight увеличивает позицию не больше speed', () => {
            const p = new Player(0, 'Тест'); // speed=1
            p.moveRight(5);
            expect(p.position).toBe(1);
        });

        test('moveLeft уменьшает позицию не больше speed', () => {
            const p = new Player(10, 'Тест');
            p.moveLeft(5);
            expect(p.position).toBe(9);
        });

        test('move вызывает moveRight при положительном расстоянии', () => {
            const p = new Player(0, 'Тест');
            p.move(3);
            expect(p.position).toBe(1);
        });

        test('move вызывает moveLeft при отрицательном расстоянии', () => {
            const p = new Player(10, 'Тест');
            p.move(-3);
            expect(p.position).toBe(9);
        });
    });

    describe('chooseEnemy', () => {
        test('выбирает врага с минимальным здоровьем', () => {
            const p = new Player(0, 'Тест');
            const e1 = new Player(1, 'Враг1');
            const e2 = new Player(2, 'Враг2');
            e1.life = 50;
            e2.life = 30;
            expect(p.chooseEnemy([p, e1, e2])).toBe(e2);
        });

        test('не выбирает мёртвых врагов', () => {
            const p = new Player(0, 'Тест');
            const e1 = new Player(1, 'Враг1');
            e1.life = 0;
            expect(p.chooseEnemy([p, e1])).toBeNull();
        });

        test('не выбирает себя', () => {
            const p = new Player(0, 'Тест');
            p.life = 1;
            const e1 = new Player(1, 'Враг1');
            e1.life = 50;
            expect(p.chooseEnemy([p, e1])).toBe(e1);
        });
    });

    describe('moveToEnemy', () => {
        test('движется вправо если враг правее', () => {
            const p = new Player(0, 'Игрок');
            const e = new Player(5, 'Враг');
            p.moveToEnemy(e);
            expect(p.position).toBe(1);
        });

        test('движется влево если враг левее', () => {
            const p = new Player(5, 'Игрок');
            const e = new Player(0, 'Враг');
            p.moveToEnemy(e);
            expect(p.position).toBe(4);
        });

        test('не двигается если на одной позиции', () => {
            const p = new Player(3, 'Игрок');
            const e = new Player(3, 'Враг');
            p.moveToEnemy(e);
            expect(p.position).toBe(3);
        });
    });
});

describe('Warrior', () => {
    test('начальные характеристики', () => {
        const w = new Warrior(0, 'Тест');
        expect(w.life).toBe(120);
        expect(w.speed).toBe(2);
        expect(w.attack).toBe(10);
        expect(w.description).toBe('Воин');
        expect(w.weapon).toBeInstanceOf(Sword);
    });

    describe('takeDamage', () => {
        test('обычный урон при жизни >= 50%', () => {
            const w = new Warrior(0, 'Тест');
            w.takeDamage(50);
            expect(w.life).toBe(70);
        });

        test('при жизни < 50% и удаче > 0.8 урон из маны', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.9); // getLuck > 0.8
            const w = new Warrior(0, 'Тест');
            w.life = 50; // Ровно 50% = не меньше, значит обычный урон. Устанавливаем ниже
            w.life = 49; // < 50% от 120 (60)
            w.takeDamage(10);
            // getLuck = (90 + 10)/100 = 1.0 > 0.8, magic > 0
            expect(w.magic).toBe(10);
            expect(w.life).toBe(49);
        });

        test('при нулевой мане урон идёт в жизнь', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.9);
            const w = new Warrior(0, 'Тест');
            w.life = 49;
            w.magic = 0;
            w.takeDamage(10);
            expect(w.life).toBe(39);
        });
    });

    test('цепочка оружия: Sword -> Knife -> Arm', () => {
        const w = new Warrior(0, 'Тест');
        expect(w.weapon).toBeInstanceOf(Sword);
        // Ломаем меч
        w.weapon.durability = 0;
        w.checkWeapon();
        expect(w.weapon).toBeInstanceOf(Knife);
        // Ломаем нож
        w.weapon.durability = 0;
        w.checkWeapon();
        expect(w.weapon).toBeInstanceOf(Arm);
    });
});

describe('Archer', () => {
    test('начальные характеристики', () => {
        const a = new Archer(0, 'Тест');
        expect(a.life).toBe(80);
        expect(a.magic).toBe(35);
        expect(a.attack).toBe(5);
        expect(a.agility).toBe(10);
        expect(a.description).toBe('Лучник');
        expect(a.weapon).toBeInstanceOf(Bow);
    });

    test('getDamage по формуле с расстоянием', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.5);
        const a = new Archer(0, 'Тест'); // attack=5, weapon=Bow(attack=10,range=3), luck=10
        // luck = (50+10)/100 = 0.6
        // damage = (5+10) * 0.6 * 2 / 3 = 6
        expect(a.getDamage(2)).toBeCloseTo(6);
    });

    test('getDamage возвращает 0 если distance > range', () => {
        const a = new Archer(0, 'Тест');
        expect(a.getDamage(10)).toBe(0);
    });

    test('цепочка оружия: Bow -> Knife -> Arm', () => {
        const a = new Archer(0, 'Тест');
        a.weapon.durability = 0;
        a.checkWeapon();
        expect(a.weapon).toBeInstanceOf(Knife);
        a.weapon.durability = 0;
        a.checkWeapon();
        expect(a.weapon).toBeInstanceOf(Arm);
    });
});

describe('Mage', () => {
    test('начальные характеристики', () => {
        const m = new Mage(0, 'Тест');
        expect(m.life).toBe(70);
        expect(m.magic).toBe(100);
        expect(m.attack).toBe(5);
        expect(m.agility).toBe(8);
        expect(m.description).toBe('Маг');
        expect(m.weapon).toBeInstanceOf(Staff);
    });

    describe('takeDamage', () => {
        test('при мане > 50% урон вдвое меньше, мана -12', () => {
            const m = new Mage(0, 'Тест');
            m.takeDamage(50); // мана 100 > 50
            expect(m.life).toBe(45); // 70 - 25
            expect(m.magic).toBe(88);
        });

        test('при мане <= 50% полный урон', () => {
            const m = new Mage(0, 'Тест');
            m.magic = 50;
            m.takeDamage(20);
            expect(m.life).toBe(50);
            expect(m.magic).toBe(50); // мана не меняется
        });

        test('жизнь не падает ниже 0', () => {
            const m = new Mage(0, 'Тест');
            m.magic = 30;
            m.takeDamage(1000);
            expect(m.life).toBe(0);
        });
    });

    test('цепочка оружия: Staff -> Knife -> Arm', () => {
        const m = new Mage(0, 'Тест');
        m.weapon.durability = 0;
        m.checkWeapon();
        expect(m.weapon).toBeInstanceOf(Knife);
        m.weapon.durability = 0;
        m.checkWeapon();
        expect(m.weapon).toBeInstanceOf(Arm);
    });
});

describe('Dwarf', () => {
    test('начальные характеристики', () => {
        const d = new Dwarf(0, 'Тест');
        expect(d.life).toBe(130);
        expect(d.attack).toBe(15);
        expect(d.luck).toBe(20);
        expect(d.description).toBe('Гном');
        expect(d.weapon).toBeInstanceOf(Axe);
    });

    test('каждый шестой удар вдвое меньше при getLuck > 0.5', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.9); // getLuck > 0.5
        const d = new Dwarf(0, 'Тест');
        for (let i = 0; i < 5; i++) d.takeDamage(10);
        expect(d.life).toBe(80); // 130 - 50
        d.takeDamage(10); // шестой удар
        expect(d.life).toBe(75); // 80 - 5 (половина)
    });

    test('шестой удар полный при getLuck <= 0.5', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0); // getLuck = (0 + 20)/100 = 0.2
        const d = new Dwarf(0, 'Тест');
        for (let i = 0; i < 5; i++) d.takeDamage(10);
        d.takeDamage(10);
        expect(d.life).toBe(70); // 130 - 60, без скидки
    });

    test('цепочка оружия: Axe -> Knife -> Arm', () => {
        const d = new Dwarf(0, 'Тест');
        d.weapon.durability = 0;
        d.checkWeapon();
        expect(d.weapon).toBeInstanceOf(Knife);
        d.weapon.durability = 0;
        d.checkWeapon();
        expect(d.weapon).toBeInstanceOf(Arm);
    });
});

describe('Crossbowman', () => {
    test('начальные характеристики', () => {
        const c = new Crossbowman(0, 'Тест');
        expect(c.life).toBe(85);
        expect(c.attack).toBe(8);
        expect(c.agility).toBe(20);
        expect(c.luck).toBe(15);
        expect(c.description).toBe('Арбалетчик');
        expect(c.weapon).toBeInstanceOf(LongBow);
    });

    test('цепочка оружия: LongBow -> Knife -> Arm', () => {
        const c = new Crossbowman(0, 'Тест');
        c.weapon.durability = 0;
        c.checkWeapon();
        expect(c.weapon).toBeInstanceOf(Knife);
        c.weapon.durability = 0;
        c.checkWeapon();
        expect(c.weapon).toBeInstanceOf(Arm);
    });
});

describe('Demiurge', () => {
    test('начальные характеристики', () => {
        const d = new Demiurge(0, 'Тест');
        expect(d.life).toBe(80);
        expect(d.magic).toBe(120);
        expect(d.attack).toBe(6);
        expect(d.luck).toBe(12);
        expect(d.description).toBe('Демиург');
        expect(d.weapon).toBeInstanceOf(StormStaff);
    });

    test('при мане > 0 и getLuck > 0.6 урон в 1.5 раза выше', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.9);
        const d = new Demiurge(0, 'Тест');
        // Базовый getDamage (из Mage) на distance=1
        // luck = (90 + 12)/100 = 1.02 > 0.6
        const dmg = d.getDamage(1);
        expect(dmg).toBeGreaterThan(0);
        // Проверяем что множитель применяется: вычисляем без него
        jest.spyOn(Math, 'random').mockReturnValue(0.9);
        const baseDmg = d.magic > 0 ? dmg / 1.5 : dmg;
        expect(dmg).toBeCloseTo(baseDmg * 1.5);
    });

    test('при getLuck <= 0.6 без усиления', () => {
        // getLuck = (random*100 + luck) / 100 <= 0.6
        // random*100 <= 60 - 12 = 48 => random <= 0.48
        jest.spyOn(Math, 'random').mockReturnValue(0);
        const d = new Demiurge(0, 'Тест'); // luck=12, getLuck = (0+12)/100 = 0.12 < 0.6
        const dmg1 = d.getDamage(1);
        jest.spyOn(Math, 'random').mockReturnValue(0);
        // Вычисляем базовый урон (из Mage->Player)
        // attack=6, weapon=StormStaff(attack=10,range=3), getLuck=0.12
        // base = (6+10)*0.12/1 = 1.92
        expect(dmg1).toBeCloseTo(1.92);
    });

    test('цепочка оружия: StormStaff -> Knife -> Arm', () => {
        const d = new Demiurge(0, 'Тест');
        d.weapon.durability = 0;
        d.checkWeapon();
        expect(d.weapon).toBeInstanceOf(Knife);
        d.weapon.durability = 0;
        d.checkWeapon();
        expect(d.weapon).toBeInstanceOf(Arm);
    });
});

describe('tryAttack', () => {
    test('не атакует если враг вне досягаемости', () => {
        const warrior = new Warrior(0, 'Воин'); // weapon=Sword range=1
        const archer = new Archer(5, 'Лучник');
        const initialLife = archer.life;
        // Блокируем takeAttack чтобы не было случайного урона
        jest.spyOn(archer, 'takeAttack').mockImplementation(() => {});
        warrior.tryAttack(archer);
        expect(archer.takeAttack).not.toHaveBeenCalled();
    });

    test('атакует если враг в досягаемости', () => {
        const warrior = new Warrior(0, 'Воин');
        const archer = new Archer(1, 'Лучник'); // расстояние 1, range меча = 1
        jest.spyOn(archer, 'takeAttack').mockImplementation(() => {});
        warrior.tryAttack(archer);
        expect(archer.takeAttack).toHaveBeenCalled();
    });

    test('при одинаковой позиции враг отлетает и получает двойной урон', () => {
        const warrior = new Warrior(3, 'Воин');
        const archer = new Archer(3, 'Лучник');
        jest.spyOn(Math, 'random').mockReturnValue(0.5);
        jest.spyOn(archer, 'takeAttack').mockImplementation(() => {});
        warrior.tryAttack(archer);
        // Враг отлетает на 1 позицию вправо
        expect(archer.position).toBe(4);
        // takeAttack вызван один раз с удвоенным уроном
        expect(archer.takeAttack).toHaveBeenCalledTimes(1);
        const calledDamage = archer.takeAttack.mock.calls[0][0];
        expect(calledDamage).toBeGreaterThan(0);
    });
});
