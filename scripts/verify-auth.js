// Node 18+ has native fetch
async function verify() {
    const baseUrl = 'http://localhost:3000';
    
    console.log('1. Logging in as vet@vetapp.com...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'vet@vetapp.com', password: 'senha123' })
    });

    if (!loginRes.ok) {
        console.error('Login Failed:', await loginRes.text());
        return;
    }

    const loginData = await loginRes.json();
    console.log('Login Success!');
    console.log('Token Type:', loginData.token ? 'JWT Present' : 'Missing');
    console.log('Response Type:', loginData.user?.currentOrganization ? 'Scoped (Direct)' : 'Neutral (List)');
    
    let scopedToken = loginData.token;
    
    if (!loginData.user?.currentOrganization) {
        console.log('Received Neutral Token. Memberships:', loginData.memberships?.length);
        if (!loginData.memberships || loginData.memberships.length === 0) {
            console.error('No memberships found for verification!');
            return;
        }

        const orgId = loginData.memberships[0].organizationId;
        console.log(`2. Selecting Organization: ${loginData.memberships[0].organizationName} (${orgId})`);
        
        const selectRes = await fetch(`${baseUrl}/auth/select-org`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginData.token}`
            },
            body: JSON.stringify({ organizationId: orgId })
        });

        if (!selectRes.ok) {
            console.error('Select Org Failed:', await selectRes.text());
            return;
        }

        const selectData = await selectRes.json();
        console.log('Select Org Success!');
        console.log('Scoped Token Type:', selectData.user?.currentOrganization ? 'Scoped' : 'Unknown');
        scopedToken = selectData.token;
    }

    console.log('3. Accessing Protected Resource (Products)...');
    const prodRes = await fetch(`${baseUrl}/products`, {
        method: 'GET',
        headers: { 
            'Authorization': `Bearer ${scopedToken}`
        }
    });

    if (prodRes.ok) {
        const prodData = await prodRes.json();
        console.log('Access Granted! Products found:', prodData.length);
    } else {
        console.error('Access Denied:', await prodRes.status, await prodRes.text());
    }
}

verify().catch(console.error);
