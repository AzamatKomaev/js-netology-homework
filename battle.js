// Функция проведения королевской битвы до последнего выжившего
function play(players) {
    console.log('Королевская битва начинается!');
    players.forEach(p => console.log(`  ${p.description} ${p.name} на позиции ${p.position}`));

    let round = 0;

    while (true) {
        const alive = players.filter(p => !p.isDead());

        if (alive.length <= 1) break;

        round++;
        console.log(`\n--- Раунд ${round} ---`);

        for (const player of alive) {
            if (player.isDead()) continue;
            player.turn(players);
        }

        // Вывод состояния живых после раунда
        players.filter(p => !p.isDead()).forEach(p => {
            console.log(`  ${p.name}: жизнь=${p.life.toFixed(1)} мана=${p.magic.toFixed(1)} позиция=${p.position}`);
        });
    }

    const survivors = players.filter(p => !p.isDead());
    if (survivors.length === 1) {
        console.log(`\n=== Победитель: ${survivors[0].description} ${survivors[0].name}! ===`);
        return survivors[0];
    } else {
        console.log('\n=== Ничья! ===');
        return null;
    }
}

module.exports = { play };

