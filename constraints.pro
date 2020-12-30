% Add yarn constraints
% see more: https://yarnpkg.com/features/constraints


% All packages must have a "MIT" license field
gen_enforced_field(WorkspaceCwd, 'license', 'MIT').

% All packages must have a engines.node field of >=12
gen_enforced_field(WorkspaceCwd, 'engines.node', '>=12').
gen_enforced_field(WorkspaceCwd, 'engineStrict', true).

% All packages must work with the GitHub Package Registry
gen_enforced_field(WorkspaceCwd, 'repository.type', 'git').
gen_enforced_field(WorkspaceCwd, 'repository.url', 'https://github.com/Chnapy/timeflies.git').
gen_enforced_field(WorkspaceCwd, 'repository.directory', WorkspaceCwd).
