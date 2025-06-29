"use client"

import { useState, useEffect } from "react"
import { Plus, Trophy, Calendar, CheckCircle2, Gift, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"

interface Task {
  id: string
  title: string
  description: string
  frequency: "daily" | "weekly" | "monthly"
  points: number
  completed: boolean
  lastCompleted?: Date
  nextDue: Date
}

interface Reward {
  id: string
  title: string
  description: string
  cost: number
  claimed: boolean
}

export default function Component() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [totalPoints, setTotalPoints] = useState(0)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isAddRewardOpen, setIsAddRewardOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    frequency: "daily" as const,
    points: 10,
  })
  const [newReward, setNewReward] = useState({
    title: "",
    description: "",
    cost: 50,
  })

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks")
    const savedRewards = localStorage.getItem("rewards")
    const savedPoints = localStorage.getItem("totalPoints")

    if (savedTasks) setTasks(JSON.parse(savedTasks))
    if (savedRewards) setRewards(JSON.parse(savedRewards))
    if (savedPoints) setTotalPoints(Number.parseInt(savedPoints))
  }, [])

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem("rewards", JSON.stringify(rewards))
  }, [rewards])

  useEffect(() => {
    localStorage.setItem("totalPoints", totalPoints.toString())
  }, [totalPoints])

  const getNextDueDate = (frequency: string) => {
    const now = new Date()
    switch (frequency) {
      case "daily":
        return new Date(now.getTime() + 24 * 60 * 60 * 1000)
      case "weekly":
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      case "monthly":
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000)
    }
  }

  const addTask = () => {
    if (!newTask.title.trim()) return

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      frequency: newTask.frequency,
      points: newTask.points,
      completed: false,
      nextDue: getNextDueDate(newTask.frequency),
    }

    setTasks([...tasks, task])
    setNewTask({ title: "", description: "", frequency: "daily", points: 10 })
    setIsAddTaskOpen(false)
    toast({
      title: "Tarefa adicionada!",
      description: "Sua nova tarefa foi criada com sucesso.",
    })
  }

  const addReward = () => {
    if (!newReward.title.trim()) return

    const reward: Reward = {
      id: Date.now().toString(),
      title: newReward.title,
      description: newReward.description,
      cost: newReward.cost,
      claimed: false,
    }

    setRewards([...rewards, reward])
    setNewReward({ title: "", description: "", cost: 50 })
    setIsAddRewardOpen(false)
    toast({
      title: "Recompensa adicionada!",
      description: "Nova recompensa disponível na loja.",
    })
  }

  const completeTask = (taskId: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId && !task.completed) {
          setTotalPoints((prev) => prev + task.points)
          toast({
            title: "Tarefa concluída! 🎉",
            description: `Você ganhou ${task.points} pontos de produtividade!`,
          })
          return {
            ...task,
            completed: true,
            lastCompleted: new Date(),
            nextDue: getNextDueDate(task.frequency),
          }
        }
        return task
      }),
    )
  }

  const claimReward = (rewardId: string) => {
    const reward = rewards.find((r) => r.id === rewardId)
    if (!reward || totalPoints < reward.cost) return

    setTotalPoints((prev) => prev - reward.cost)
    setRewards(rewards.map((r) => (r.id === rewardId ? { ...r, claimed: true } : r)))
    toast({
      title: "Recompensa resgatada! 🎁",
      description: `Você resgatou: ${reward.title}`,
    })
  }

  const resetTasks = () => {
    setTasks(tasks.map((task) => ({ ...task, completed: false })))
  }

  const pendingTasks = tasks.filter((task) => !task.completed)
  const completedTasks = tasks.filter((task) => task.completed)
  const availableRewards = rewards.filter((reward) => !reward.claimed)

  const getFrequencyBadge = (frequency: string) => {
    const colors = {
      daily: "bg-green-100 text-green-800",
      weekly: "bg-blue-100 text-blue-800",
      monthly: "bg-purple-100 text-purple-800",
    }
    const labels = {
      daily: "Diária",
      weekly: "Semanal",
      monthly: "Mensal",
    }
    return (
      <Badge className={colors[frequency as keyof typeof colors]}>{labels[frequency as keyof typeof labels]}</Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Produtividade Gamificada</h1>
          <p className="text-gray-600">Transforme suas tarefas em conquistas e ganhe recompensas!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Star className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{totalPoints}</p>
                  <p className="text-sm text-gray-600">Pontos Totais</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{completedTasks.length}</p>
                  <p className="text-sm text-gray-600">Concluídas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{pendingTasks.length}</p>
                  <p className="text-sm text-gray-600">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Gift className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{availableRewards.length}</p>
                  <p className="text-sm text-gray-600">Recompensas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="tasks" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tasks">Minhas Tarefas</TabsTrigger>
            <TabsTrigger value="rewards">Loja de Recompensas</TabsTrigger>
            <TabsTrigger value="progress">Progresso</TabsTrigger>
          </TabsList>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Suas Tarefas</h2>
              <div className="space-x-2">
                <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Tarefa
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Nova Tarefa</DialogTitle>
                      <DialogDescription>
                        Crie uma nova tarefa periódica e defina quantos pontos ela vale.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Título da Tarefa</Label>
                        <Input
                          id="title"
                          value={newTask.title}
                          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                          placeholder="Ex: Exercitar-se por 30 minutos"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          value={newTask.description}
                          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                          placeholder="Descreva os detalhes da tarefa..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="frequency">Frequência</Label>
                        <Select
                          value={newTask.frequency}
                          onValueChange={(value: any) => setNewTask({ ...newTask, frequency: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Diária</SelectItem>
                            <SelectItem value="weekly">Semanal</SelectItem>
                            <SelectItem value="monthly">Mensal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="points">Pontos de Recompensa</Label>
                        <Input
                          id="points"
                          type="number"
                          value={newTask.points}
                          onChange={(e) => setNewTask({ ...newTask, points: Number.parseInt(e.target.value) || 10 })}
                          min="1"
                        />
                      </div>
                      <Button onClick={addTask} className="w-full">
                        Criar Tarefa
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" onClick={resetTasks}>
                  Resetar Tarefas
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pending Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Tarefas Pendentes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendingTasks.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Nenhuma tarefa pendente! 🎉</p>
                  ) : (
                    pendingTasks.map((task) => (
                      <div key={task.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold">{task.title}</h3>
                            {task.description && <p className="text-sm text-gray-600">{task.description}</p>}
                          </div>
                          <Button size="sm" onClick={() => completeTask(task.id)} className="ml-2">
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex justify-between items-center">
                          {getFrequencyBadge(task.frequency)}
                          <Badge variant="secondary">+{task.points} pontos</Badge>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Completed Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>Tarefas Concluídas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {completedTasks.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Nenhuma tarefa concluída ainda.</p>
                  ) : (
                    completedTasks.map((task) => (
                      <div key={task.id} className="border rounded-lg p-4 space-y-2 bg-green-50">
                        <div>
                          <h3 className="font-semibold text-green-800">{task.title}</h3>
                          {task.description && <p className="text-sm text-green-600">{task.description}</p>}
                        </div>
                        <div className="flex justify-between items-center">
                          {getFrequencyBadge(task.frequency)}
                          <Badge className="bg-green-100 text-green-800">+{task.points} pontos ✓</Badge>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Loja de Recompensas</h2>
              <Dialog open={isAddRewardOpen} onOpenChange={setIsAddRewardOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Recompensa
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Nova Recompensa</DialogTitle>
                    <DialogDescription>
                      Crie uma nova recompensa que você poderá resgatar com seus pontos.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reward-title">Título da Recompensa</Label>
                      <Input
                        id="reward-title"
                        value={newReward.title}
                        onChange={(e) => setNewReward({ ...newReward, title: e.target.value })}
                        placeholder="Ex: Sair com amigos"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reward-description">Descrição</Label>
                      <Textarea
                        id="reward-description"
                        value={newReward.description}
                        onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                        placeholder="Descreva a recompensa..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="cost">Custo em Pontos</Label>
                      <Input
                        id="cost"
                        type="number"
                        value={newReward.cost}
                        onChange={(e) => setNewReward({ ...newReward, cost: Number.parseInt(e.target.value) || 50 })}
                        min="1"
                      />
                    </div>
                    <Button onClick={addReward} className="w-full">
                      Criar Recompensa
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableRewards.map((reward) => (
                <Card key={reward.id} className="relative">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Gift className="h-5 w-5 text-purple-500" />
                      <span>{reward.title}</span>
                    </CardTitle>
                    <CardDescription>{reward.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="text-purple-600">
                        {reward.cost} pontos
                      </Badge>
                      <Button
                        size="sm"
                        disabled={totalPoints < reward.cost}
                        onClick={() => claimReward(reward.id)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Resgatar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {availableRewards.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma recompensa disponível. Adicione algumas!</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span>Seu Progresso</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Pontos de Produtividade</span>
                    <span className="text-sm text-gray-600">{totalPoints} pontos</span>
                  </div>
                  <Progress value={Math.min((totalPoints / 1000) * 100, 100)} className="h-3" />
                  <p className="text-xs text-gray-500 mt-1">Próximo marco: 1000 pontos</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Estatísticas</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Total de tarefas:</span>
                        <span>{tasks.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tarefas concluídas:</span>
                        <span>{completedTasks.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxa de conclusão:</span>
                        <span>{tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Recompensas resgatadas:</span>
                        <span>{rewards.filter((r) => r.claimed).length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Conquistas</h3>
                    <div className="space-y-2">
                      {totalPoints >= 100 && (
                        <Badge className="bg-yellow-100 text-yellow-800">🏆 Primeira Centena</Badge>
                      )}
                      {completedTasks.length >= 10 && (
                        <Badge className="bg-green-100 text-green-800">✅ Executor Dedicado</Badge>
                      )}
                      {tasks.length >= 5 && <Badge className="bg-blue-100 text-blue-800">📋 Organizador</Badge>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
