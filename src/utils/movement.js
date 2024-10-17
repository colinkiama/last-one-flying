export function handlePlayerMovement (scene, player, movementKeys) {
    const { up, down, left, right } = movementKeys;

    if (left.isDown) {
        player.setAngularVelocity(-400);
    } else if (right.isDown) {
        player.setAngularVelocity(400);
    } else {
        player.setAngularVelocity(0);
    }

    if (up.isDown) {
        scene.physics.velocityFromRotation(player.rotation, 300, player.body.velocity);
    } else if (down.isDown) {
        scene.physics.velocityFromRotation(player.rotation, -300, player.body.velocity);
    } else {
        player.setVelocity(0);
    }

    // Set body size based on rotation boundaries (due to limitation of arcade physics body not supporting rotation)
    const verticalBoundaries = [Math.PI / 2, -Math.PI / 2 ];
    const horizontalBoundaries = [0, -Math.PI, Math.PI];

    const verticalDifferences = verticalBoundaries.map(
        (num) => Math.abs(player.rotation - num)
    );
    const horizontalDifferences = horizontalBoundaries.map(
        (num) => Math.abs(player.rotation - num)
    );

    let verticalDifference, horizontalDifference = Math.MAX;

    verticalDifference = verticalBoundaries.map(
        (num) => Math.abs(player.rotation - num)
    ).reduce((lastValue, currentValue) => {
        return currentValue < lastValue ? currentValue : lastValue
    }, Number.MAX_VALUE);

    horizontalDifference = horizontalBoundaries.map(
        (num) => Math.abs(player.rotation - num)
    ).reduce((lastValue, currentValue) => {
        return currentValue < lastValue ? currentValue : lastValue
    }, Number.MAX_VALUE);

    if ((verticalDifference < horizontalDifference)) {
        if (player.body.width !== 24) {
            player.setBodySize(24, 32, 8);
        }
    } else if (player.body.width.x !== 32) {
        player.setBodySize(32, 24, 8);
    }

    scene.physics.world.wrap(player, player.width / 2);
}
