import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";


export const environment = {

  getClient : () => new SecretsManagerClient({region: "ts-region"}),
  retrieve : async (secname, env = null) => {
    let rv =  await $.client.send(new GetSecretValueCommand({
        SecretId:secname, 
        VersionId:env,
    }))

    return rv;
},
appEnv : process.env["APPENV"]
}