# Quantumult X import notes

Do NOT add examples/QuantumultX-v2-branch-test.conf as a remote resource.
That file is a complete profile fragment and contains section headers such as [policy].

Use:
- resources/XHS-Upload.list as a filter resource, with Policy Override enabled and set to your desired publish policy/node.
- resources/XHS-Direct.list as a filter resource, Policy Override disabled.
- rewrite/XHS-Publish-Precise.snippet as a rewrite resource.

The dedicated static policy line must be pasted once into the main profile [policy] section if you want an isolated user-selectable group.
