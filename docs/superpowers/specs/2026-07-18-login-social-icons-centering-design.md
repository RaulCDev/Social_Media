# Login social icons centering

## Goal

Reduce visual noise on the login screen by aligning the horizontal center of
the X, LinkedIn, and GitHub icon row with the horizontal center of the
`LogIn with GitHub` button.

## Scope

- Change only the social icon row on the login screen.
- Preserve icon sizes, button sizes, spacing, links, hover states, and login
  behavior.
- Do not change the equivalent icon row in the application sidebar.

## Design

The login icon container will center its existing children across the width of
the login panel. The login panel remains centered in the viewport and keeps its
current intrinsic width, which is established by the wider login button.

## Verification

- Confirm the three social icons share the login button's horizontal center.
- Confirm the login button and OAuth behavior are unchanged.
- Confirm the layout remains centered at desktop and narrow viewport widths.
