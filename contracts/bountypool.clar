;; Bounty Pool - Decentralized Gig Economy
;; Post bounties in STX, approve submissions, and release funds.

(define-constant err-not-found (err u100))
(define-constant err-unauthorized (err u101))
(define-constant err-already-completed (err u102))

(define-data-var bounty-nonce uint u0)

(define-map bounties
    uint
    {
        issuer: principal,
        amount: uint,
        description: (string-utf8 100),
        status: (string-ascii 20), ;; "OPEN", "SUBMITTED", "COMPLETED"
        assignee: (optional principal)
    }
)

(define-public (post-bounty (amount uint) (description (string-utf8 100)))
    (let
        (
            (id (var-get bounty-nonce))
        )
        ;; Lock funds
        (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
        
        (map-set bounties id {
            issuer: tx-sender,
            amount: amount,
            description: description,
            status: "OPEN",
            assignee: none
        })
        
        (var-set bounty-nonce (+ id u1))
        (ok id)
    )
)

(define-public (submit-work (id uint))
    (let
        (
            (bounty (unwrap! (map-get? bounties id) err-not-found))
        )
        (asserts! (is-eq (get status bounty) "OPEN") err-already-completed)
        
        (map-set bounties id (merge bounty {
            status: "SUBMITTED",
            assignee: (some tx-sender)
        }))
        (ok true)
    )
)

(define-public (approve-and-pay (id uint))
    (let
        (
            (bounty (unwrap! (map-get? bounties id) err-not-found))
            (worker (unwrap! (get assignee bounty) err-not-found))
        )
        (asserts! (is-eq tx-sender (get issuer bounty)) err-unauthorized)
        (asserts! (is-eq (get status bounty) "SUBMITTED") err-already-completed)
        
        ;; Payout
        (try! (as-contract (stx-transfer? (get amount bounty) tx-sender worker)))
        
        (map-set bounties id (merge bounty {
            status: "COMPLETED"
        }))
        (ok true)
    )
)
