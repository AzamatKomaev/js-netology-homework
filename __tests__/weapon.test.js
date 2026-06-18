const { Weapon, Arm, Bow, Sword, Knife, Staff, LongBow, Axe, StormStaff } = require('../weapon');

describe('Weapon', () => {
    test('конструктор устанавливает все свойства', () => {
        const w = new Weapon('Тест', 20, 100, 2);
        expect(w.name).toBe('Тест');
        expect(w.attack).toBe(20);
        expect(w.durability).toBe(100);
        expect(w.initDurability).toBe(100);
        expect(w.range).toBe(2);
    });

    describe('takeDamage', () => {
        test('уменьшает прочность на значение урона', () => {
            const w = new Weapon('Тест', 10, 100, 1);
            w.takeDamage(30);
            expect(w.durability).toBe(70);
        });

        test('прочность не падает ниже 0', () => {
            const w = new Weapon('Тест', 10, 50, 1);
            w.takeDamage(200);
            expect(w.durability).toBe(0);
        });

        test('не уменьшает Infinity', () => {
            const arm = new Arm();
            arm.takeDamage(1000);
            expect(arm.durability).toBe(Infinity);
        });
    });

    describe('getDamage', () => {
        test('возвращает полный урон при прочности >= 30%', () => {
            const w = new Weapon('Тест', 20, 100, 1);
            expect(w.getDamage()).toBe(20);
            w.takeDamage(70); // durability = 30 = 30%
            expect(w.getDamage()).toBe(20);
        });

        test('возвращает половину урона при прочности < 30%', () => {
            const w = new Weapon('Тест', 20, 100, 1);
            w.takeDamage(71); // durability = 29 < 30%
            expect(w.getDamage()).toBe(10);
        });

        test('возвращает 0 при сломанном оружии', () => {
            const w = new Weapon('Тест', 20, 50, 1);
            w.takeDamage(50);
            expect(w.getDamage()).toBe(0);
        });
    });

    describe('isBroken', () => {
        test('возвращает false при прочности > 0', () => {
            const w = new Weapon('Тест', 10, 100, 1);
            expect(w.isBroken()).toBe(false);
        });

        test('возвращает true при прочности = 0', () => {
            const w = new Weapon('Тест', 10, 50, 1);
            w.takeDamage(50);
            expect(w.isBroken()).toBe(true);
        });
    });
});

describe('Arm', () => {
    test('правильные характеристики', () => {
        const arm = new Arm();
        expect(arm.name).toBe('Рука');
        expect(arm.attack).toBe(1);
        expect(arm.durability).toBe(Infinity);
        expect(arm.range).toBe(1);
    });
});

describe('Bow', () => {
    test('правильные характеристики', () => {
        const bow = new Bow();
        expect(bow.name).toBe('Лук');
        expect(bow.attack).toBe(10);
        expect(bow.durability).toBe(200);
        expect(bow.range).toBe(3);
    });

    test('пример из задания', () => {
        const bow = new Bow();
        expect(bow.getDamage()).toBe(10);
        bow.takeDamage(100);
        expect(bow.getDamage()).toBe(10);
        expect(bow.durability).toBe(100);
        bow.takeDamage(50);
        expect(bow.getDamage()).toBe(5);
        expect(bow.durability).toBe(50);
        bow.takeDamage(150);
        expect(bow.getDamage()).toBe(0);
        expect(bow.durability).toBe(0);
    });
});

describe('Sword', () => {
    test('правильные характеристики', () => {
        const s = new Sword();
        expect(s.name).toBe('Меч');
        expect(s.attack).toBe(25);
        expect(s.durability).toBe(500);
        expect(s.range).toBe(1);
    });
});

describe('Knife', () => {
    test('правильные характеристики', () => {
        const k = new Knife();
        expect(k.name).toBe('Нож');
        expect(k.attack).toBe(5);
        expect(k.durability).toBe(300);
        expect(k.range).toBe(1);
    });
});

describe('Staff', () => {
    test('правильные характеристики', () => {
        const s = new Staff();
        expect(s.name).toBe('Посох');
        expect(s.attack).toBe(8);
        expect(s.durability).toBe(300);
        expect(s.range).toBe(2);
    });
});

describe('LongBow', () => {
    test('правильные характеристики', () => {
        const lb = new LongBow();
        expect(lb.name).toBe('Длинный лук');
        expect(lb.attack).toBe(15);
        expect(lb.range).toBe(4);
        expect(lb.durability).toBe(200); // наследуется от Bow
    });
});

describe('Axe', () => {
    test('правильные характеристики', () => {
        const axe = new Axe();
        expect(axe.name).toBe('Секира');
        expect(axe.attack).toBe(27);
        expect(axe.range).toBe(1); // наследуется от Sword
        expect(axe.durability).toBe(800);
    });
});

describe('StormStaff', () => {
    test('правильные характеристики', () => {
        const ss = new StormStaff();
        expect(ss.name).toBe('Посох Бури');
        expect(ss.attack).toBe(10);
        expect(ss.range).toBe(3);
        expect(ss.durability).toBe(300); // наследуется от Staff
    });
});
