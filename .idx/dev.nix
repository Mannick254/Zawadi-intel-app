devun { pkgs, ... }: {
  channel = "stable-24.05";

  packages = [
    pkgs.nodejs_20
    pkgs.nodePackages.nodemon
    pkgs.nodePackages.typescript
    pkgs.nodePackages.ts-node
    pkgs.git
  ];

  env = {
    FIREBASE_PROJECT = "zawadi-intel";
    NODE_ENV = "development";
  };

  idx = {
    extensions = [
      "vscodevim.vim"
      "esbenp.prettier-vscode"
      "dbaeumer.vscode-eslint"
    ];

    previews = {
      backend = {
        command = "cd server && npm run dev";
        manager = "web";
      };
    };

    tasks = {
      install = {
        command = "cd server && npm install";
        description = "Install server dependencies";
      };
      lint = {
        command = "cd server && npm run lint";
        description = "Run ESLint checks";
      };
      format = {
        command = "cd server && npm run format";
        description = "Format code with Prettier";
      };
    };
  };
}
