module.exports = {
    apps : [{
        name: `wanderers-phoenix`,
        script: 'npm run start',
        env_phoenix: {
            WC_ENV: "dev",
            NODE_ENV: "production"
        }
    },{
        name: `wanderers-production`,
        script: 'npm run start',
        env_production: {
            WC_ENV: "prod",
            NODE_ENV: "production"
        }
    }],
    // Deployment Configuration
    deploy : {
        phoenix : {
            "user" : "jumpscare",
            "host" : ["kirito.yggdrasil.cat"],
            "ref"  : "origin/phoenix",
            "repo" : "git@github.com:jumpsca-re/wanderers-api.git",
            "path" : "/home/jumpscare/phoenix",
            "post-deploy" : "yarn install && pm2 startOrRestart yggdrasil.config.cjs --only wanderers-phoenix --env phoenix"
        },
        production : {
            "user" : "jumpscare",
            "host" : ["kirito.yggdrasil.cat"],
            "ref"  : "origin/prod",
            "repo" : "git@github.com:jumpsca-re/wanderers-api.git",
            "path" : "/home/jumpscare/production",
            "post-deploy" : "yarn install && pm2 startOrRestart yggdrasil.config.cjs --only wanderers-production --env production"
        }
    }
};