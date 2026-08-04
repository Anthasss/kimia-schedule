import { solveRotation, cleanLecturerName } from './rotationSolver';

function check(name: string, classes: [string, string[]][], expected: boolean) {
  const result = solveRotation(classes.map(([id, lecturers]) => ({ id, lecturers })));
  const ok = expected ? result !== null : result === null;
  if (!ok) {
    throw new Error(`${name}: expected ${expected ? 'feasible' : 'infeasible'} but got ${result !== null ? 'feasible' : 'infeasible'}`);
  }
  console.log(`PASS ${name}`);
}

check('share two distinct halves', [
  ['X', ['L1', 'L2']],
  ['Y', ['L1', 'L3']],
], true);

check('infeasible trio overbooked', [
  ['X', ['L1', 'L2']],
  ['Y', ['L1', 'L3']],
  ['Z', ['L1', 'L4']],
], false);

check('triangle feasible', [
  ['X', ['L1', 'L2']],
  ['Y', ['L2', 'L3']],
  ['Z', ['L3', 'L1']],
], true);

check('identical trio infeasible', [
  ['X', ['L1', 'L2']],
  ['Y', ['L1', 'L2']],
  ['Z', ['L1', 'L2']],
], false);

check('n=1 same person infeasible', [['X', ['L1']], ['Y', ['L1']]], false);

check('n=1 different people feasible', [['X', ['L1']], ['Y', ['L2']]], true);

check('n=3 quartet feasible', [
  ['W', ['L1', 'L2', 'L3']],
  ['X', ['L1', 'L2', 'L4']],
  ['Y', ['L1', 'L3', 'L4']],
  ['Z', ['L2', 'L3', 'L4']],
], true);

check('n=3 lecturer in four classes infeasible', [
  ['V', ['L1', 'L2', 'L3']],
  ['W', ['L1', 'L2', 'L4']],
  ['X', ['L1', 'L3', 'L5']],
  ['Y', ['L1', 'L4', 'L6']],
  ['Z', ['L1', 'L5', 'L7']],
], false);

// Mixed count checks
check('mixed counts disjoint feasible', [
  ['X', ['L1', 'L2']],
  ['Y', ['L3', 'L4', 'L5']],
], true);

check('mixed counts shared feasible (load 5/6)', [
  ['X', ['L1', 'L2']],
  ['Y', ['L1', 'L3', 'L4']],
], true);

check('mixed counts shared infeasible (load 1.5)', [
  ['X', ['L1', 'L2']],
  ['Y', ['L1', 'L3']],
  ['Z', ['L1', 'L4']],
], false);

check('mixed counts shared infeasible (1 + 0.5 = 1.5)', [
  ['X', ['L1']],
  ['Y', ['L1', 'L2']],
], false);

function checkCleanName(input: string, expected: string) {
  const actual = cleanLecturerName(input);
  if (actual !== expected) {
    throw new Error(`cleanLecturerName("${input}"): expected "${expected}" but got "${actual}"`);
  }
  console.log(`PASS cleanLecturerName: "${input}" -> "${actual}"`);
}

checkCleanName('Prof. Dr. Febri O. Nitbani, S.Si, M.Si', 'Febri Nitbani');
checkCleanName('Pius Dore Ola, S.Si, M.Si., Ph.D', 'Pius Dore Ola');
checkCleanName('Sherly M. F. Ledoh, S.Si.,M.Sc', 'Sherly Ledoh');
checkCleanName('Prof. Philiphi de Rozari, S.Si, M.Si.,M.Sc.,Ph.D', 'Philiphi de Rozari');
checkCleanName('Marlon J.R. Benu.,S.Si.,M.Si', 'Marlon Benu');
checkCleanName('Yunita E.Damaledo.,S.H', 'Yunita E.Damaledo');

console.log('All rotation solver checks passed');
