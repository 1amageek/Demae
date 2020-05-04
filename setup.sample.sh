firebase use default

firebase functions:config:set \
stripe.api_key="sk_test_xxxxx" \
stripe.account="acct_xxxxxx" \
stripe.account_link_success_url="https://localhost:3000" \
stripe.account_link_failure_url="https://localhost:3000" \
firebase functions:config:get
