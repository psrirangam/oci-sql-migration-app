# OCI SQL Server Migration App - TODO

## Phase 1: Remove Database Dependency
- [ ] Remove tRPC backend dependencies
- [ ] Remove database schema and migrations
- [ ] Convert admin dashboard to client-side only
- [ ] Update assessment storage to use localStorage
- [ ] Remove OAuth/authentication backend logic

## Phase 2: Add Client-Side Admin Authentication
- [ ] Create admin login page with username/password
- [ ] Implement client-side authentication (Msadmin/MSadmin@ccelerators)
- [ ] Add session management with localStorage
- [ ] Protect admin dashboard with login check
- [ ] Add logout functionality

## Phase 3: Update Assessment Export
- [ ] Update CSV export to use localStorage data
- [ ] Update PDF export to work without backend
- [ ] Ensure all exports work client-side

## Phase 4: Build Static Deployment
- [ ] Remove all server code
- [ ] Build static HTML/CSS/JS
- [ ] Create deployment guide for OCI Object Storage
- [ ] Test static build locally
- [ ] Prepare for OCI Object Storage upload

## Phase 5: Remove Manus Branding
- [x] Remove "Built with Manus" references from footer
- [x] Remove Manus logos and branding
- [x] Update copyright and attribution
- [x] Verify no Manus references remain

## Phase 6: Bug Fixes & Improvements
- [x] Fix migration approach logic (Lift & Shift always, Re-platform for PaaS only, Re-factor for Oracle DBs)
- [x] Redesign PDF with professional formatting and better spacing
- [x] Update PDF color scheme to professional corporate style
- [x] Admin dashboard login moved to /admin route (hidden from header)
- [ ] Test questionnaire flow
- [ ] Test admin login
- [ ] Test assessment export
- [ ] Test PDF download
- [ ] Verify all features work without backend
