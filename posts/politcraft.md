---
title: 'Politcraft'
date: '2026-11-05'
description: 'An experimental strategy game about political power, institutions, and a fractured world, running entirely in the browser.'
tags: 'Game Development, Browser Game, Python, WebAssembly'
author: 'Gentry Demchak'
image: 'content-assets/politcraft-game.jpg'
---

[Play Politcraft in your browser](https://politcraft.gentrydemchak.com).

## The experiment

Politcraft is a single-player strategy experiment about competing systems of government. You choose a faction, appoint a leader, and make decisions about institutions, resources, political influence, and military power while three bots govern the rival factions.

The setting is a contemporary world whose institutions have fractured. People, technology, machinery, and infrastructure still exist, but authority, trust, and coordination have broken down. Rebuilding a functioning society is part of the competition for power.

The design question is how much strategic depth can come from governing the conditions of a society. Policies and commitments change local conditions; territories then cooperate, resist, grow, migrate, or decline. The aim is to make those consequences understandable without asking the player to manage every delivery route or maintenance job.

## Four ways to govern

Each faction operates in the same world with different powers, constraints, and conditions for success:

- **The Collective** commits to public production plans and works through councils and shared provision.
- **The Market** uses treasury spending, policy, and investment to extend its influence.
- **The Directorate** relies on authority, governing commands, and military power.
- **The Free Territories** coordinates voluntary associations, mutual aid, and local defense.

![Politcraft faction selection, showing the four factions and the Collective's starting position](content-assets/politcraft-factions.jpg)

The current prototype uses strategic cycles. You stage domestic choices, political operations, and intelligence orders, then resolve them alongside the other factions' plans. Reports, projections, and a causal log help explain what changed. Information about rivals can be incomplete or out of date, so observation is part of the strategy.

Matches run for up to 18 cycles. Each faction has its own ideological objective, and a private directive provides an optional secondary goal. A match can end with a contested world rather than an arbitrary winner.

## From Python to the browser

Politcraft started as a Python game with a Textual terminal interface. The browser version preserves that interface and runs the same simulation code through Pyodide and WebAssembly.

Python runs inside a browser Web Worker, while the page displays the terminal and forwards keyboard and mouse input. There is no running game server: AWS Amplify serves the static files, and each player's device runs its own match. This keeps the hosting footprint small enough for an experiment.

The conversion was checked against the native Python version using five complete seeded matches. All 84 cycle states matched exactly. A separate browser playthrough completed the full 18-cycle loop with network access disabled after startup.

## Try it

[Launch Politcraft](https://politcraft.gentrydemchak.com) on a desktop browser with a keyboard and mouse. The first load downloads Python and the game dependencies, so give it a moment to start.

This is still a prototype. Matches live in the current tab: refreshing or closing the page loses progress. Once the game has loaded, ordinary play does not need a continuous network connection.
