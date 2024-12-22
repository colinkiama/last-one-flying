# Last One Flying

An arcade survival shooter made with Phaser 3

## Requirements

- A http server. Run the server in the root of the project
- [Bun](https://bun.sh) (Optional - Used for automated build instructions if you don't want to copy files over manually)

## Development Commands

**Note**: This is a #nobuild project. There are no build steps required to start developing the project however, for production environments, optimised files can be used to save space and improve loading times.

The following instructions in this sect explain how to copy the game code files to a different location to be ready for production environments.

### Automated

**Note**: You must successfully run `bun install` at least once first. Otherwise, the other build commands will not work.

| Command | Description |
|---------|-------------|
| `bun install` | Install project dependencies |
| `bun run dev` | Launch a development web server |
| `bun run prod` | Copy game files into `dist` folder |
| `bun run export` | Run `bun run build` then create a `.zip` file containing a copy of the contents of the `dist` folder |

### Manual

If you don't want to use `bun`, these instructions tell you how to perform the tasks that the development scripts automate:

#### Production Environment Setup

Copy the following files and directories into an directory, to prepare the game for a production environment:

- `assets/`
- `src/`
- `vendor/phaser.esm.min.js` (This is the minified version)
- `favicon.png`
- `style.css`

**Important**: Then, copy `prod/index.html` to the root of the directory (`your_prod_directory/index.html`).

`prod/index.html` refers to `vendor/phaser.esm.min.js` instead of `vendor/phaser.esm.js`.

#### Export

Compress all the contents from `your_prod_directory/` in the production environment setup instructions into a .zip file:

## Writing Code

After cloning the repo, run `bun install` from your project directory. Then, you can start the local development server by running `bun run dev` (or use your own http server).

The local development server runs on `http://localhost:8080` by default. Please see the [alive-server](https://github.com/ljcp/alive-server) documentation if you wish to change this, or add SSL support.

Once the server is running you can edit any of the files in the project folder. This will reload the browser.

## Project Structure

We have provided a default project structure to get you started. This is as follows:

- `index.html` - A basic HTML page to contain the game.
- `src` - Contains the game source code.
- `src/main.js` - The main entry point. This contains the game configuration and starts the game.
- `src/scenes/` - The Phaser Scenes are in this folder.
- `style.css` - Some simple CSS rules to help with page layout.
- `assets` - Contains the static assets used by the game.
- `scripts/` - Development scripts

## Handling Assets

To load static files such as audio files, videos, etc place them into the `assets` folder. Then you can use this path in the Loader calls within Phaser:

```js
preload ()
{
    //  This is an example of an imported bundled image.
    //  Remember to import it at the top of this file
    this.load.image('logo', logoImg);

    //  This is an example of loading a static image
    //  from the public/assets folder:
    this.load.image('background', 'assets/bg');
}
```

## Deploying to Production

After you run the `bun run prod` command, your game's code will be copied to the `dist` directory.

In order to deploy your game, you will need to upload *all* of the contents of the `dist` folder to a public facing web server.

You can run the `bun run export` command to create a `.zip` file of the game's code, to upload to platforms like https://itch.io.

## Extra Notes

Made with [Phaser](https://phaser.io)
