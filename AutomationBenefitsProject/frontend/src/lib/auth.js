const seed = () => {
    const k = 'ab.users'
    if(!localStorage.getItem(k)) {
        const users = [
            {id:'1',email:'admin@example.com', name: 'Admin User', role: 'Admin', password: 'Admin123$'},
            {id:'2',email:'user@example.com', name: 'User One', role: 'User', password: 'User1234$'},
        ]
        localStorage
    }
}

seed()

export const Auth = {
    login: (email, password) => {
        const users = JSON.parse(localStorage.getItem('ab.users') || [])
        const u = users.find(x => x.email.tolocaleLowerCase() === email.toLocaleLowerCase() && x.password === password  )
        if(!u) throw new Error ('Invalid credentials')
        localStorage.setItem('ab.session', JSON.stringify({userID: u.id, email: u.email, name: u.name, role: u.role }))
        return {...u, password: undefined}
    },
    logout: () => localStorage.removeItem('ab.session'),
    me: () => JSON.parse(localStorage.getItem('ab.session') || null)
}