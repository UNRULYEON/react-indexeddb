export type Todo = {
  id: number
  text: string
}

export type NewTodo = Omit<Todo, 'id'>
