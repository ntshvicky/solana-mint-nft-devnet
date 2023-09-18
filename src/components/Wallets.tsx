import { VStack, Button, Image, Text } from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";

import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  walletAdapterIdentity,
  toMetaplexFile,
} from "@metaplex-foundation/js"

import { Connection, clusterApiUrl, PublicKey, LAMPORTS_PER_SOL, Keypair } from "@solana/web3.js";
import { useState } from "react";

const connection = new Connection(clusterApiUrl('devnet'))

const Wallets = () => {
  const { select, wallets, publicKey, disconnect } = useWallet();

  const [balance, setBalance] = useState(0)
  const [address, setAddress] = useState('')
  const [buffer, setBuffer] = useState('')


  const readBalance = (address: string) => {
    setAddress(address)
    const key = new PublicKey(address)
    connection.getBalance(key).then(balance => {
      setBalance(balance / LAMPORTS_PER_SOL)
    })
  }

  const readFile = (event: any) => {
    const fileReader = new FileReader();
    const { files } = event.target;
    setBuffer(files)
  };


  const mintNft = async (address: string) => {
    console.log('mintNft', wallets)
    const metaplex = Metaplex.make(connection)
    .use(walletAdapterIdentity(wallets[0].adapter))
    .use(
        bundlrStorage({
            address: "https://devnet.bundlr.network",
            providerUrl: "https://api.devnet.solana.com",
            timeout: 60000,
        }),
    );
      
    //const file = toMetaplexFile(buffer, "image.png");

    //const imageUri = await metaplex.storage().upload(file);

    const { uri } = await metaplex.nfts().uploadMetadata({
        name: "My NFT",
        description: "My description",
        image: 'https://ipfs.moralis.io:2053/ipfs/QmbgukbMog1WntmY3zfrsVq6rMgSxUiEYNaFdHeDnPvRRx',
    });

    const { nft } = await metaplex.nfts().create(
      {
          uri: uri,
          name: "AbraKaDabra Guitar",
          symbol: "ABRAKA",
          sellerFeeBasisPoints: 0,
          collection: new PublicKey('B9h6htca1Z2iGKT9bvhMoMaVM8VAU1apPFAMWYeGDPb6')
      },
      { commitment: "finalized" },
  );

  console.log(
    `Collection Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`
)
console.log(nft.mint.address)
    //this is what verifies our collection as a Certified Collection
     /* await metaplex.nfts().verifyCollection({    
        mintAddress: nft.mint.address,
        collectionMintAddress:  new PublicKey('oWRhqsihvBt6297PzWBiLTS1hM9gaJLKv6hAsjfmrZ7'),
        isSizedCollection: true,
    })*/

  }

  const verifyCollection = async (address: string) =>{
  
    const metaplex = Metaplex.make(connection)
    .use(walletAdapterIdentity(wallets[0].adapter))
    .use(
        bundlrStorage({
            address: "https://devnet.bundlr.network",
            providerUrl: "https://api.devnet.solana.com",
            timeout: 60000,
        }),
    );

    console.log(publicKey)

    const ncp = new PublicKey('CmowLCD9yDh4Kcan4yj6W8tG7PYQ4yyrWwVaNxsM5FJE')
    console.log(ncp)

    const ccp =  new PublicKey('B9h6htca1Z2iGKT9bvhMoMaVM8VAU1apPFAMWYeGDPb6')

      //this is what verifies our collection as a Certified Collection
      const ss = await metaplex.nfts().verifyCollection({    
        mintAddress: ncp,
        collectionMintAddress: ccp,
        isSizedCollection: true,
    })
    console.log(ss)
  }

  const createCollection = async (address: string) => {
    const metaplex = Metaplex.make(connection)
    .use(walletAdapterIdentity(wallets[0].adapter))
    .use(
        bundlrStorage({
            address: "https://devnet.bundlr.network",
            providerUrl: "https://api.devnet.solana.com",
            timeout: 60000,
        }),
    );

    const { uri } = await metaplex.nfts().uploadMetadata({
      name: "My NFT",
      description: "My description",
      image: 'https://ipfs.moralis.io:2053/ipfs/QmbgukbMog1WntmY3zfrsVq6rMgSxUiEYNaFdHeDnPvRRx',
  });

      const { nft } = await metaplex.nfts().create(
        {
            uri: uri,
            name: "Mastmoula Guitar",
            symbol: "MGT",
            sellerFeeBasisPoints: 0,
            isCollection: true,
        },
        { commitment: "finalized" }
    )

    console.log(
        `Collection Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`
    )

    return nft

  }

      // helper function update NFT
      const updateNftUri = async  () => {

        const metaplex = Metaplex.make(connection)
        .use(walletAdapterIdentity(wallets[0].adapter))
        .use(
            bundlrStorage({
                address: "https://devnet.bundlr.network",
                providerUrl: "https://api.devnet.solana.com",
                timeout: 60000,
            }),
        );

        const mintAddress = new PublicKey('CmowLCD9yDh4Kcan4yj6W8tG7PYQ4yyrWwVaNxsM5FJE')
        
        // fetch NFT data using mint address
        const nft = await metaplex.nfts().findByMint({ mintAddress })

        // update the NFT metadata
        const { response } = await metaplex.nfts().update(
          {
            nftOrSft: nft,
            uri: 'https://ipfs.moralis.io:2053/ipfs/QmcfV82ichGv5oajZgNfSWFkQrnRR6V2uiEsAzVdiakhR5/metadata/1.json',
          },
          { commitment: "finalized" }
        )

        console.log(
          `Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`
        )

        console.log(
          `Transaction: https://explorer.solana.com/tx/${response.signature}?cluster=devnet`
        )
      }

  return !publicKey ? (
    <VStack gap={4}>
      {wallets.filter((wallet) => wallet.readyState === "Installed").length >
      0 ? (
        wallets
          .filter((wallet) => wallet.readyState === "Installed")
          .map((wallet) => (
            <Button
              key={wallet.adapter.name}
              onClick={() => select(wallet.adapter.name)}
              w="64"
              size="lg"
              fontSize="md"
              leftIcon={
                <Image
                  src={wallet.adapter.icon}
                  alt={wallet.adapter.name}
                  h={6}
                  w={6}
                />
              }
            >
              {wallet.adapter.name}
            </Button>
          ))
      ) : (
        <Text>No wallet found. Please download a supported Solana wallet</Text>
      )}
    </VStack>
  ) : (
    <VStack gap={4}>
      <Text>{publicKey.toBase58()} : SOL {balance}</Text>
      <Button onClick={() => readBalance(publicKey.toBase58())}>Read Balance</Button>
      <input title="upload" type="file" onChange={readFile} ></input>
      <Button onClick={() => mintNft(publicKey.toBase58())}>Mint NFT</Button>

      <Button onClick={() => verifyCollection(publicKey.toBase58())}>Verify Collection</Button>
      <Button onClick={() => createCollection(publicKey.toBase58())}>Create Collection </Button>
      <Button onClick={() => updateNftUri()}>Update NFT URI</Button>

      <Button onClick={disconnect}>disconnect wallet</Button>
    </VStack>
  );
};

export default Wallets;
