---
title: 'Bitcoin Progress'
date: '2019-01-01'
description: 'Twitter bot that provides regular updates on the Bitcoin protocol progress toward the next subsidy halving event'
tags: 'Python, AWS Lambda, Tweepy, Bots, Twitter, Bitcoin'
author: 'Gentry Demchak'
image: '/images/bitcoin-progress.jpg'
---

### A twitter bot that posts regular updates about the quadrennial block subsidy halvening event.

I created this twitter bot to help educate folks about Bitcoins programatic supply cap of 21 million coins (or to be more precise 2,100,000,000,000,000 sats, the smallest unit.).

The Bitcoin protocol was initilized to subsidize[^1] miners 50 bitcoin for every block they found. The subsidy is halved every 210,000 blocks that are mined until it reaches 0. This simple algorithm is how Bitcoin will eventually arrive at the 21 million supply cap.

![formula for bitcoin supply](/images/bitcoin-supply-formula.webp)

### Architecture for the bot
A few things were needed for this bot to function:
-  Access to the [Twitter API](https://developer.twitter.com/en/docs/twitter-api), creation of a twitter account and app, along with keys / tokens / secrets for auth so the bot can post updates to twitter.
- A way to check the current block height so we can derive our progress toward the next subsidy halving. For that we can simply and freely poll https://blockchain.info/q/getblockcount from the [blockchain.com Query API](https://www.blockchain.com/explorer/api/q).
- A service to post from. [AWS Lambda](https://aws.amazon.com/lambda/) serverless is a fantastic option as this bot isn't doing any heavy or frequent computation that would warrant an entire server instance. Plus it's free for the amount of usage this bot requires! 
- A language and library to interact with Twitter: Python and [Tweepy](https://www.tweepy.org/) are easy to use and well documented.
- Finally, a trigger that invokes the Lambda function on a regular interval. For simplicity, Amazon EventBridge can be used to call a service based on simple rules.


#### General outline

1. Follow the [Twitter Development Platform getting started guide](https://developer.twitter.com/en/docs/twitter-api/getting-started/getting-access-to-the-twitter-api). Get API keys and create an app.
2. Setup an AWS account.
3. Create a new Lambda function.
4. Add twitter access token + token secret + consumer key + consumer secret from the twitter app to the Lambda environment variables so the Lambda function will have authorization to post to Twitter.
5. Install [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
6. Setup a git repository for the project.
7. Create a local python virtualenv.
8. ✨ [Write code!](https://github.com/deevolutionism/bitcoin-halving-progress-bar) ✨ 
9. Create a deployment package by zipping up the python function and all package dependencies.
10. Deploy package to the lambda function utilizing AWS CLI [update-function-code](https://docs.aws.amazon.com/cli/latest/reference/lambda/update-function-code.html) 
11. Setup EventBridge trigger to invoke the Lambda function every 5 minutes. (bitcoin blocks are mined, on average, every 10 minutes, so we need to check for a new block height at *least* every 10 minutes)
12. 🤑 Profit

### Result
A bot that publishes regular updates on progress toward the next bitcoin subsidy halvening!

<p>TESTING</p>

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Subsidy Era: 4<br>Block Subsidy: ₿6.25<br>Blocks Remaining: 65098<br>Estimated 452 days until <a href="https://twitter.com/hashtag/BitcoinHalvening?src=hash&amp;ref_src=twsrc%5Etfw">#BitcoinHalvening</a><br>██████████░░░░░ 69%<a href="https://twitter.com/hashtag/Bitcoin?src=hash&amp;ref_src=twsrc%5Etfw">#Bitcoin</a></p>&mdash; BITCOIN HALVENING (@BitcoinProgress) <a href="https://twitter.com/BitcoinProgress/status/1621595344835416086?ref_src=twsrc%5Etfw">February 3, 2023</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

#### Improvements

The iteration loop (develop => deploy => test) was a bit of an arduous process as it involves zipping the the project, deploying to AWS via the CLI, invoking the function to see if it would work, etc. Eventually, I started editing the Lamda function directly from the AWS Lambda IDE 🙊 to speed this iteration loop up. Alternatively, I could explore configuring a CI/CD system leveraging github actions.

I don't like that it polls the blockchain.com API every 5 minutes. I'd like to find a way to subscribe to a websocket that notifies me when a new block is mined. I'm not sure if any bitcoin RPC APIs offer this functionality, but I'll look into it.

#### Interesting bits of code / challenges

Deriving subsidy:

There are a couple ways to derive subsidy. One way is to look at the data from the current block and simply subtract the total output value from the total input value. The difference will give you the subsidy. This data can be found using the blockchair.com api by first retrieving the latest block, and then looking up  https://api.blockchair.com/bitcoin/dashboards/block/776555

Alternatively, if we know a few constants and know the current block height, the we can derive the value ourself with a simple formula.

The bitcoin protocol has defined few consensus critical constants that we can use:

[COIN](https://github.com/bitcoin/bitcoin/blob/fb2f0934799a4e84b9d89fd58d594435358b4366/src/consensus/amount.h#L15) = 100000000

[nSubsidy](https://github.com/bitcoin/bitcoin/blob/fb2f0934799a4e84b9d89fd58d594435358b4366/src/validation.cpp#L1508) = 50

[nSubsidyHalvingInterval](https://github.com/bitcoin/bitcoin/blob/fb2f0934799a4e84b9d89fd58d594435358b4366/src/chainparams.cpp#L66) = 210000

Given these constants and a known blockheight, we can use a simple formula:

subsidy = (nSubsidy >> subsidy_era - 1) / COIN 

```python
def block_subsidy(self):
    subsidy_era = self.subsidy_era()
    # use a bitwise right shift to halve the subsidy based on the era
    subsidy = ( self.INIT_MINING_SUBSIDY >> subsidy_era - 1 ) / self.COIN
    return subsidy
```

A few constants we need:

- COIN = 100,000,000 as defined in the [Bitcoin consensus](https://github.com/bitcoin/bitcoin/blob/fb2f0934799a4e84b9d89fd58d594435358b4366/src/consensus/amount.h#L15) (each Bitcoin is 100MM sats).
- INIT_MINING_SUBSIDY = 50 as defined in the Bitcoin code base
- We also need the current subsidy_era which we get with this function:

```python
def subsidy_era(self):
    return math.ceil((self.CURRENT_BLOCK_HEIGHT / self.HALVING_INTERVAL))
```


[^1]: Some argue the *subsidy* should be called a *reward*, however, as the subsidy eventually reaches 0 and the network is intended to utlimately be fully supported by transaction fees, it makes more sense to call it a subsidy.