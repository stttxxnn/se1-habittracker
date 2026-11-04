// Composition Root: einzige Stelle, an der Adapter und Services zusammengebaut werden.
// Die Präsentation (habitStore) bekommt nur die Inbound Ports und weiß nicht,
// welche Datenbank dahinter steckt.
import type { InjectionKey } from 'vue'
import type { HabitRepositoryPort } from '@/domain/Ports/Out/HabitRepositoryPort'
import type { GetHabitQuery } from '@/domain/Ports/In/GetHabitQuery'
import type { GetAllHabitsQuery } from '@/domain/Ports/In/GetAllHabitsQuery'
import type { CreateHabitCommand } from '@/domain/Ports/In/CreateHabitCommand'
import type { UpdateHabitCommand } from '@/domain/Ports/In/UpdateHabitCommand'
import type { DeleteHabitCommand } from '@/domain/Ports/In/DeleteHabitCommand'
import { GetHabitService } from '@/domain/Services/GetHabitService'
import { GetAllHabitsService } from '@/domain/Services/GetAllHabitsService'
import { CreateHabitService } from '@/domain/Services/CreateHabitService'
import { UpdateHabitService } from '@/domain/Services/UpdateHabitService'
import { DeleteHabitService } from '@/domain/Services/DeleteHabitService'

export interface HabitUseCases {
  getHabit: GetHabitQuery
  getAllHabits: GetAllHabitsQuery
  createHabit: CreateHabitCommand
  updateHabit: UpdateHabitCommand
  deleteHabit: DeleteHabitCommand
}

export const HABIT_USE_CASES: InjectionKey<HabitUseCases> = Symbol('HabitUseCases')

// Bekommt den Outbound Port, nicht den konkreten Adapter.
// Welcher Adapter benutzt wird, entscheidet der Aufrufer (main.ts oder ein Test).
export function createHabitUseCases(repo: HabitRepositoryPort): HabitUseCases {
  return {
    getHabit: new GetHabitService(repo),
    getAllHabits: new GetAllHabitsService(repo),
    createHabit: new CreateHabitService(repo),
    updateHabit: new UpdateHabitService(repo),
    deleteHabit: new DeleteHabitService(repo),
  }
}
