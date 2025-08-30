// Local-first project store; later we swap with API calls.
const PK = 'ab.projects'
const read = () => JSON.parse(localStorage.getItem(PK) || '[]')
const write = (arr) => localStorage.setItem(PK, JSON.stringify(arr))

export const ProjectStatus = { Submitted:'Submitted', InReview:'InReview', Approved:'Approved', ChangesRequested:'ChangesRequested' }

export const Store = {
  listAll: () => read().sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)),
  listMine: (userId) => read().filter(x=>x.requesterUserId===userId).sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)),
  get: (id) => read().find(x=>x.id===id),
  create: (data, me) => {
    const now = new Date().toISOString()
    const p = {
      id: crypto.randomUUID(),
      requesterUserId: me.userId, requesterName: me.name, requesterEmail: me.email,
      status: ProjectStatus.Submitted,
      createdAt: now, updatedAt: now,
      review: { comments: [] },
      ...data
    }
    const arr = read(); arr.push(p); write(arr)
    return p
  },
  approve: (id, admin, note='') => {
    const arr = read()
    const p = arr.find(x=>x.id===id); if(!p) throw new Error('Not found')
    p.status = ProjectStatus.Approved
    p.review.comments.push({ by: admin.name, at:new Date().toISOString(), text: note || 'Approved' })
    p.updatedAt = new Date().toISOString()
    write(arr)
  },
  requestChanges: (id, admin, comment) => {
    const arr = read()
    const p = arr.find(x=>x.id===id); if(!p) throw new Error('Not found')
    p.status = ProjectStatus.ChangesRequested
    p.review.comments.push({ by: admin.name, at:new Date().toISOString(), text: comment })
    p.updatedAt = new Date().toISOString()
    write(arr)
  }
}
