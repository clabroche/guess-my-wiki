
declare namespace Express {
  export interface Request {
    user: User;
    filter?: { [key: string]: any }
  }
}

interface User {
  _id: ObjectID;
}