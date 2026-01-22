# Module 5: Customer Service Verification - Testing Checklist

## Web (CS Dashboard)
- [ ] Login as **Customer Service** (`cs1@example.com`)
- [ ] Open **CS Dashboard** from header
- [ ] Verify stats load (pending / verified / rejected / total)
- [ ] Filter by status / city / property type / urgency / search
- [ ] Open a property → review details + images
- [ ] Approve listing → status becomes `live`
- [ ] Reject listing with reason → status becomes `rejected`

## Mobile (CS Dashboard)
- [ ] Login as **Customer Service** (`cs1@example.com`)
- [ ] Tap CS icon on Home AppBar
- [ ] Verify stats load
- [ ] Apply filters (status, urgency, property type, city, search)
- [ ] Open property detail → verify images render
- [ ] Approve listing → status becomes `live`
- [ ] Reject listing with reason → status becomes `rejected`

## Sample Data
- [ ] Load module 1–4 data: `./scripts/load-sample-data.sh`
- [ ] Load Module 5 sample data: `./scripts/load-module5-sample-data.sh`
