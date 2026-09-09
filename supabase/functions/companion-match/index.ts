// Scaffold only. Implement caller authorization before adding privileged operations.
Deno.serve(() => Response.json({ error: 'companion-match is not implemented' }, { status: 501 }));
