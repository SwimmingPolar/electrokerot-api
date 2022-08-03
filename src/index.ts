import express, { Request, Response } from 'express'

const app = express()

app.get('/', (req: Request, res: Response) => {
  res.send('hello from node backend')
})

app.listen(5611, () => {
  console.log('App running again')
})
