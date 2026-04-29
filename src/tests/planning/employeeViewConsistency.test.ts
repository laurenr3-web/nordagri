import { describe, it, expect } from 'vitest';

/**
 * Cohérence de la vue "Par employé" :
 * - planning_tasks.assigned_to stocke un auth user_id (uuid).
 * - teamMembers[].id DOIT être ce même user_id, afin que le groupement
 *   par membre affiche le bon nom pour chaque tâche assignée.
 *
 * Ces tests reproduisent la logique de groupement (PlanningContent +
 * EmployeeView) sans monter le composant, pour verrouiller l'invariant.
 */

type Profile = { id: string; first_name: string | null; last_name: string | null };
type FarmMember = { id: string; user_id: string; role: string };

function buildTeamMembers(
  ownerId: string,
  members: FarmMember[],
  profiles: Profile[],
) {
  const memberMap = new Map(members.map(m => [m.user_id, m]));
  return profiles.map(p => ({
    // CRITIQUE : doit être le user_id (auth.users.id), pas farm_members.id.
    id: p.id,
    name: [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Sans nom',
    isOwner: p.id === ownerId,
    userId: p.id,
    farmMemberId: memberMap.get(p.id)?.id ?? null,
  }));
}

type Task = { id: string; title: string; assigned_to: string | null };

function groupByEmployee(
  tasks: Task[],
  teamMembers: ReturnType<typeof buildTeamMembers>,
) {
  const groups = new Map<string | null, Task[]>();
  for (const t of tasks) {
    const key = t.assigned_to;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(t);
  }
  return teamMembers.map(m => ({
    memberId: m.id,
    name: m.name,
    tasks: groups.get(m.id) ?? [],
  }));
}

describe('EmployeeView — cohérence assigned_to ↔ membre affiché', () => {
  const OWNER_ID = '11111111-1111-1111-1111-111111111111';
  const SUZIE_USER_ID = '22222222-2222-2222-2222-222222222222';
  const OLIVIER_USER_ID = '33333333-3333-3333-3333-333333333333';

  const members: FarmMember[] = [
    { id: 'fm-suzie', user_id: SUZIE_USER_ID, role: 'member' },
    { id: 'fm-olivier', user_id: OLIVIER_USER_ID, role: 'member' },
  ];
  const profiles: Profile[] = [
    { id: OWNER_ID, first_name: 'Pierre', last_name: 'Dupont' },
    { id: SUZIE_USER_ID, first_name: 'Suzie', last_name: 'Martin' },
    { id: OLIVIER_USER_ID, first_name: 'Olivier', last_name: 'Tremblay' },
  ];

  it('teamMembers[].id est toujours un user_id, jamais un farm_members.id', () => {
    const team = buildTeamMembers(OWNER_ID, members, profiles);
    const validUserIds = new Set([OWNER_ID, SUZIE_USER_ID, OLIVIER_USER_ID]);
    const farmMemberIds = new Set(members.map(m => m.id));

    for (const m of team) {
      expect(validUserIds.has(m.id)).toBe(true);
      expect(farmMemberIds.has(m.id)).toBe(false);
      expect(m.id).toBe(m.userId);
    }
  });

  it('regroupe chaque tâche sous le bon nom selon assigned_to (= user_id)', () => {
    const team = buildTeamMembers(OWNER_ID, members, profiles);
    const tasks: Task[] = [
      { id: 't1', title: 'Traire les vaches', assigned_to: SUZIE_USER_ID },
      { id: 't2', title: 'Réparer clôture', assigned_to: OLIVIER_USER_ID },
      { id: 't3', title: 'Comptabilité', assigned_to: OWNER_ID },
      { id: 't4', title: 'Autre tâche Suzie', assigned_to: SUZIE_USER_ID },
    ];

    const groups = groupByEmployee(tasks, team);
    const byName = Object.fromEntries(groups.map(g => [g.name, g.tasks.map(t => t.id)]));

    expect(byName['Suzie Martin']).toEqual(['t1', 't4']);
    expect(byName['Olivier Tremblay']).toEqual(['t2']);
    expect(byName['Pierre Dupont']).toEqual(['t3']);
  });

  it("ne rattache PAS une tâche dont assigned_to est un farm_members.id (legacy)", () => {
    const team = buildTeamMembers(OWNER_ID, members, profiles);
    // Valeur legacy incorrecte : on a stocké farm_members.id au lieu du user_id.
    const tasks: Task[] = [
      { id: 'legacy', title: 'Tâche mal assignée', assigned_to: 'fm-suzie' },
    ];

    const groups = groupByEmployee(tasks, team);
    const suzieGroup = groups.find(g => g.name === 'Suzie Martin');

    // Sans le trigger de remap DB, l'ancienne valeur ne correspondrait à
    // aucun membre — c'est exactement le bug que le fix résout côté DB.
    expect(suzieGroup?.tasks).toEqual([]);
  });

  it('après remap (trigger DB), la tâche legacy se rattache au bon membre', () => {
    const team = buildTeamMembers(OWNER_ID, members, profiles);
    // Simulation du trigger normalize_planning_task_assigned_to :
    // farm_members.id → user_id correspondant.
    const remap = (assigned: string | null) => {
      const fm = members.find(m => m.id === assigned);
      return fm ? fm.user_id : assigned;
    };
    const tasks: Task[] = [
      { id: 'legacy', title: 'Tâche mal assignée', assigned_to: remap('fm-suzie') },
    ];

    const groups = groupByEmployee(tasks, team);
    const suzieGroup = groups.find(g => g.name === 'Suzie Martin');
    expect(suzieGroup?.tasks.map(t => t.id)).toEqual(['legacy']);
  });
});