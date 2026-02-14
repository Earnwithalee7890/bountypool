# Bounty Pool 💰

**Bounty Pool** is a decentralized gig economy protocol on Stacks. It enables anyone to post tasks funded with STX, and developers to earn crypto by solving them.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![DeFi](https://img.shields.io/badge/tag-Gig%20Economy-green)

## Workflow

1.  **Post Bounty**: Issuer locks STX in the contract.
2.  **Submit Work**: Contributor marks the bounty as "Submitted".
3.  **Approve & Pay**: Issuer verifies work and releases funds instantly.

## Contract Interface

```clarity
(post-bounty (amount uint) (description (string-utf8 100)))
(submit-work (id uint))
(approve-and-pay (id uint))
```

## Setup

```bash
clarinet test
```

## License
MIT
