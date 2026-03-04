# Testing Checklist

Complete this checklist before deploying to production.

## Pre-Build Tests

### Installation
- [ ] `npm install` completes without errors
- [ ] All dependencies installed correctly
- [ ] No critical security vulnerabilities

### Development Server
- [ ] `npm run dev` starts successfully
- [ ] Server runs at http://localhost:3000
- [ ] No console errors on startup

### Build Process
- [ ] `npm run build` completes successfully
- [ ] Dist folder created with all files
- [ ] No build warnings or errors

---

## Functional Tests

### Login Page (login.html)
- [ ] Page loads correctly
- [ ] Space background renders with stars
- [ ] Stars have parallax effect on mouse move
- [ ] Login with username `turki` succeeds
- [ ] Login with username `mashael` succeeds
- [ ] Login with invalid username shows error
- [ ] Redirects to home.html after successful login
- [ ] Already logged-in users redirect to home

### Home Page (home.html)
- [ ] Page loads correctly
- [ ] Displays welcome message with username
- [ ] Space background animated
- [ ] Both mode cards visible and clickable
- [ ] "Black Hole" card navigates to blackhole.html
- [ ] "Wormhole" card navigates to wormhole.html
- [ ] "View Equations" button works
- [ ] "About & Rights" button works
- [ ] Logout button works and returns to login

### Black Hole Page (blackhole.html)
- [ ] Page loads correctly
- [ ] Canvas appears and is not blank
- [ ] Space background with stars renders
- [ ] Black hole (black circle) visible at center
- [ ] Photon sphere (blue ring) visible
- [ ] Accretion disk renders
- [ ] Observer indicator (yellow dot) visible
- [ ] Distance slider works
- [ ] Slider updates observer position
- [ ] HUD displays correct values:
  - [ ] Distance updates
  - [ ] Time Dilation α value correct
  - [ ] Redshift z value correct
  - [ ] Tidal Force calculates
  - [ ] FPS counter shows value
- [ ] Reset button works
- [ ] "← Home" button returns to home
- [ ] "Equations" button navigates correctly
- [ ] Footer displays copyright

### Wormhole Page (wormhole.html)
- [ ] Page loads correctly
- [ ] Canvas appears and is not blank
- [ ] Space background renders
- [ ] Embedding diagram visible
- [ ] Throat indicator (purple ring) visible
- [ ] Grid lines render for depth perception
- [ ] Observer indicator visible
- [ ] Distance slider works
- [ ] HUD displays correct values:
  - [ ] Distance updates
  - [ ] Warp Strength calculates
  - [ ] Exotic Matter indicator shows "Yes"
  - [ ] At Throat indicator works
  - [ ] FPS counter shows value
- [ ] Reset button works
- [ ] Navigation buttons work
- [ ] Footer displays copyright

### Equations Page (equations.html)
- [ ] Page loads correctly
- [ ] KaTeX equations render (not plain text)
- [ ] All tab buttons visible
- [ ] "Black Hole" tab shows by default
- [ ] Tab switching works:
  - [ ] Black Hole tab
  - [ ] Wormhole tab
  - [ ] Glossary tab
  - [ ] Assumptions tab
- [ ] All equations display correctly
- [ ] Badges show (Exact/Approximate)
- [ ] "Explain like I'm 10" sections present
- [ ] "What you see" sections present
- [ ] "← Home" button works

### About Page (about.html)
- [ ] Page loads correctly
- [ ] All sections visible:
  - [ ] Copyright & Rights
  - [ ] Project Overview
  - [ ] Technical Implementation
  - [ ] Scientific References
  - [ ] Disclaimers
  - [ ] Project Owner
- [ ] "← Home" button works
- [ ] Footer displays copyright

---

## Technical Tests

### Canvas Rendering
- [ ] Canvas creates successfully on all pages
- [ ] Canvas resizes on window resize
- [ ] No "blank canvas" failures
- [ ] Canvas buffer size updates correctly
- [ ] Device pixel ratio capped at 2.0

### Physics Calculations
- [ ] No NaN values in HUD
- [ ] No Infinity values in HUD
- [ ] Time dilation α between 0 and 1
- [ ] Redshift increases when closer
- [ ] Tidal force increases when closer
- [ ] All safety clamps working

### Performance
- [ ] Desktop: 60 FPS stable
- [ ] Laptop: 60 FPS stable
- [ ] iPad: 45-60 FPS acceptable
- [ ] Mobile: 30+ FPS acceptable
- [ ] Star count adapts to screen size
- [ ] HUD updates throttled (not every frame)
- [ ] No memory leaks (run for 5+ minutes)

### Security
- [ ] CSP headers present in all HTML files
- [ ] No inline scripts executed
- [ ] No innerHTML used for user data
- [ ] XSS test: try `<script>alert('xss')</script>` in username (should fail safely)
- [ ] Local storage only contains non-sensitive data
- [ ] Session storage cleared on logout

### Responsive Design
- [ ] Works on desktop (1920x1080)
- [ ] Works on laptop (1440x900)
- [ ] Works on iPad (1024x768)
- [ ] Works on mobile (375x667)
- [ ] Liquid glass UI visible on all sizes
- [ ] Controls accessible on small screens

---

## Browser Compatibility

### Desktop
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)

### Mobile
- [ ] Safari iOS (latest)
- [ ] Chrome Android (latest)

---

## User Flow Tests

### Owner Flow
1. [ ] Login as `turki`
2. [ ] Access all pages
3. [ ] Modify all settings
4. [ ] Settings persist on page reload
5. [ ] Logout works

### Guest Flow
1. [ ] Login as `mashael`
2. [ ] Access all pages
3. [ ] Can view all content
4. [ ] Settings work
5. [ ] Logout works

### Session Management
- [ ] Session persists on page refresh
- [ ] Session clears on logout
- [ ] Logged-out users redirect to login
- [ ] Multiple tabs share session

---

## Content Verification

### Text & Copyright
- [ ] All pages show "© 2026 Turki Abdullah"
- [ ] Footer text matches requirements
- [ ] No spelling errors in UI
- [ ] All scientific terms correct

### Equations Accuracy
- [ ] Schwarzschild radius formula correct
- [ ] Time dilation formula correct
- [ ] Redshift formula correct
- [ ] Morris-Thorne metric correct
- [ ] All symbol definitions present

---

## Edge Cases

### Extreme Values
- [ ] Distance at minimum (r = 1.02 r_s) doesn't crash
- [ ] Distance at maximum doesn't crash
- [ ] Near-horizon values handled safely
- [ ] Very fast slider movements work

### Error Handling
- [ ] Invalid login gracefully handled
- [ ] Canvas creation failure shows message
- [ ] Missing elements don't crash app
- [ ] Network errors (if any) handled

---

## Pre-Deployment Final Checks

- [ ] All console.log debug statements removed or commented
- [ ] No TODO comments left in code
- [ ] All files committed to git
- [ ] README.md accurate and complete
- [ ] LICENSE.txt present
- [ ] NOTICE.md present
- [ ] .gitignore configured correctly
- [ ] No sensitive data in repository
- [ ] Build succeeds with no warnings
- [ ] Production build tested locally (`npm run preview`)

---

## Post-Deployment Verification

### After deploying to GitHub Pages / Vercel:
- [ ] Site loads at deployment URL
- [ ] All pages accessible
- [ ] All features work same as local
- [ ] No CORS errors
- [ ] CSP not blocking functionality
- [ ] Static assets load correctly
- [ ] KaTeX CDN loads successfully

---

## Performance Benchmarks

Record these values for reference:

**Desktop (Chrome):**
- FPS: _____ 
- Star count: _____
- Load time: _____

**Laptop (Safari):**
- FPS: _____
- Star count: _____
- Load time: _____

**iPad (Safari):**
- FPS: _____
- Star count: _____
- Load time: _____

---

## Sign-Off

- [ ] All critical tests passed
- [ ] All blockers resolved
- [ ] Ready for deployment

**Tested by:** _______________  
**Date:** _______________  
**Version:** 1.0.0  

---

© 2026 Turki Abdullah. All Rights Reserved.
