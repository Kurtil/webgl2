import { compareBy } from "../utils.js";

/**
 * A Scheduler is used to schedule unique tasks.
 * If many task with the same name are added,
 * only the last task will be kept in the task list.
 * Once the scheduler run, it executes the associated callbacks of the last schedule tasks,
 * and clear the task list from the task registered once.
 *
 * @returns { Scheduler }
 */
function makeScheduler() {
  const tasks = new Map();

  const scheduler = {
    tasks,
    add(name, fn, priority = 1, once = false) {
      if (typeof fn !== "function") {
        throw new Error(
          `Scheduler - cannot add task. "fn" argument must be "function", get "${typeof fn}"`
        );
      }
      tasks.set(name, { name, fn, priority, once });
    },
    addOnce(name, fn, priority = 1) {
      this.add(name, fn, priority, true);
    },
    /**
     * Removes task associated with the given task name.
     * @param { string } taskName
     */
    remove(taskName) {
      return tasks.delete(taskName);
    },
    clear() {
      tasks.clear();
    },
    run(...args) {
      if (tasks.size > 0) {
        Array.from(tasks.values())
          .sort(compareBy("priority", false))
          .forEach(task => {
            task.fn(...args);
            if (task.once) {
              tasks.delete(task.name);
            }
          });
      }
    },
  };

  return Object.freeze(scheduler);
}

export default makeScheduler;
