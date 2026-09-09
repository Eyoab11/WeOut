// Scaffold only. Implement caller authorization before adding privileged operations.
Deno.serve(() => Response.json({ error: 'send-notification is not implemented' }, { status: 501 }));
