---
title: 'Rakonto Wordpress Plugin'
date: '2019-09-01'
description: 'A Wordpress plugin that records post timestamps on the litecoin blockchain.'
tags: 'Wordpress, PHP, JS, HTML, litecoin'
author: 'Gentry Demchak'
image: 'content-assets/rakonto-explorer.png'
---

This is a wordpress plugin that records post and edit timestamps to the litecoin blockchain, providing a verifiable and immutable chain of edits.

This was a side project I helped develop during my time at Edelman Digital in collaboration with the technology director. 

I contributed mainly to the transaction explorer.

![rakonto explorer](content-assets/rakonto-explorer-1.png)
*explorer*

![rakonto transaction](content-assets/rakonto-explorer-2.png)
*transaction*

View the plugin repo [Rakonto](https://github.com/rakonto)

```mermaid
flowchart LR
  subgraph Publisher["Publisher WordPress Site"]
    WP["WordPress"]
    Plugin["rakonto-plugin"]
    Post["Published post with #rakonto-magic marker"]
    RKTA["/rkta.txt publisher Litecoin addresses"]
    Objects["/rakonto-objects/{hash}.json recorded snapshot"]

    WP --> Plugin
    Plugin --> Post
    Plugin --> RKTA
    Plugin --> Objects
  end

  subgraph API["rakonto-api Express Backend"]
    Fetch["POST /fetch_inlined extracts marked content"]
    Send["POST /send_tx broadcasts hash + URL"]
    Verify["POST /verify_url verifies current page"]
    Data["POST /get_data fetches page or asset data"]
    Txs["POST /txs_for_url finds transactions for URL"]
    UrlFromTx["POST /url_from_tx decodes URL from tx"]
  end

  subgraph Chain["Litecoin Testnet + Insight"]
    Insight["Insight API explorer.rakonto.net"]
    LTC["Litecoin testnet transaction"]
    OpReturn["OP_RETURN content hash"]
    MultiSig["Multisig output encoded URL"]

    Insight --> LTC
    LTC --> OpReturn
    LTC --> MultiSig
  end

  subgraph Clients["Verification Clients"]
    Explorer["rakonto-explorer web app"]
    Extension["rakonto-chrome-extension"]
    User["Reader / verifier"]
  end

  subgraph Local["Local Testing Mode Needed"]
    MockAPI["Mock Rakonto API responses"]
    MockTx["Mock transactions"]
    MockContent["Mock recorded/live content"]
  end

  Plugin -- "fetch rendered post content" --> Fetch
  Plugin -- "send hash, URL, wallet info" --> Send
  Send -- "build and broadcast tx" --> Insight

  Verify -- "load live content" --> Fetch
  Verify -- "read publisher address list" --> RKTA
  Verify -- "find latest tx for URL" --> Txs
  Txs -- "query address tx history" --> Insight
  UrlFromTx -- "load tx" --> Insight

  Explorer -- "search / verify / detail views" --> API
  Extension -- "verify active browser tab" --> Verify
  User --> Explorer
  User --> Extension

  Insight -- "returns tx data" --> Txs
  Insight -- "returns tx details" --> UrlFromTx

  MockAPI -. "replaces live API for local dev" .-> API
  MockAPI -. "returns fake tx list" .-> MockTx
  MockAPI -. "returns fake snapshots" .-> MockContent
  Explorer -. "graceful fallback" .-> MockAPI
  Extension -. "local API base URL" .-> MockAPI
  Plugin -. "mock publish mode" .-> MockAPI

```
*Plugin architecture*

Contributors: [jtgrassie](https://github.com/jtgrassie) [deli-llama](https://github.com/deli-llama) [deevolutionism](https://github.com/deevolutionism) [philgomes](https://github.com/philgomes) [rakonteer](https://github.com/rakonteer)
