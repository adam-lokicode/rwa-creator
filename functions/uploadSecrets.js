const { SecretsManager } = require("@chainlink/functions-toolkit");
const ethers = require("ethers");

const uploadSecrets = async () => {
    // Hardcoded for Sepolia
    const routerAddress = "0xb83E47C2bC239B3bf370bc41e1459A34b41238D0";
    const donId = "fun-ethereum-sepolia-1";
    const gatewayUrls = [
        "https://01.functions-gateway.testnet.chain.link/",
        "https://02.functions-gateway.testnet.chain.link/",
    ];

    // Fetch environment variables
    const privateKey = process.env.PRIVATE_KEY;
    const rpcUrl = process.env.SEPOLIA_RPC_URL;
    const alpacaKey = process.env.ALPACA_KEY ?? "";
    const alpacaSecret = process.env.ALPACA_SECRET ?? "";

    // Check for missing environment variables
    if (!privateKey) throw new Error("Private key not provided - check your environment variables");
    if (!rpcUrl) throw new Error("RPC URL not provided - check your environment variables");

    const secrets = { alpacaKey, alpacaSecret };
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey);
    const signer = wallet.connect(provider); // Create ethers signer for signing transactions


    
    

    // Check LINK balance
    const linkTokenAddress = "0x779877A7B0D9E8603169DdbD7836e478b4624789"; // Replace with the LINK token contract address on Sepolia
    const linkTokenAbi = [ // Minimal ABI to get ERC20 balance
        "function balanceOf(address owner) view returns (uint256)"
    ];
    const linkTokenContract = new ethers.Contract(linkTokenAddress, linkTokenAbi, provider);
    const linkBalance = await linkTokenContract.balanceOf(signer.address);
    console.log(`LINK balance: ${ethers.utils.formatUnits(linkBalance, 18)} LINK`);
   

    // Check account balance
    const balance = ethers.utils.formatUnits(linkBalance, 18);
   

    if (linkBalance.isZero()) {
        throw new Error("Insufficient balance: 0 ETH or 0 LINK");
    }


    //Initialize SecretsManager
    const secretsManager = new SecretsManager({
        signer: signer,
        functionsRouterAddress: routerAddress,
        donId: donId,
    });
    await secretsManager.initialize();

//     const linkAmount = 2;
//     const juelsAmount = ethers.utils.parseUnits(linkAmount.toString(), 18);;
// await subscriptionManager.fundSubscription({
//   subscriptionId,
//   juelsAmount,
// })

    // Encrypt secrets and upload to DON
    const encryptedSecretsObj = await secretsManager.encryptSecrets(secrets);
    const slotIdNumber = 0; // Slot ID where to upload the secrets
    const expirationTimeMinutes = 1440; // Expiration time in minutes of the secrets, 1440 is 1 day

    console.log(`Upload encrypted secret to gateways ${gatewayUrls}. slotId ${slotIdNumber}. Expiration in minutes: ${expirationTimeMinutes}`);
    
    const uploadResult = await secretsManager.uploadEncryptedSecretsToDON({
        encryptedSecretsHexstring: encryptedSecretsObj.encryptedSecrets,
        gatewayUrls: gatewayUrls,
        slotId: slotIdNumber,
        minutesUntilExpiration: expirationTimeMinutes,
    });

    

    
    

    if (!uploadResult.success) throw new Error(`Encrypted secrets not uploaded to ${gatewayUrls}`);

    console.log(`\n✅ Secrets uploaded properly to gateways ${gatewayUrls}! Gateways response: `, uploadResult);

    const donHostedSecretsVersion = parseInt(uploadResult.version); // Fetch the reference of the encrypted secrets
    console.log(`\n✅ Secrets version: ${donHostedSecretsVersion}`);
};
uploadSecrets().catch((e) => {
    console.error(e);
    process.exit(1);
});