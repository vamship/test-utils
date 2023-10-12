/**
 * Dynamically defines develop/test/build/deploy tasks for the current project
 * based on metadata present in package.json.
 */
import _log from 'fancy-log';
import _colors from 'ansi-colors';
import _fs from 'fs';
import _gulp from 'gulp';
import { Project, getTaskFactory } from '@vamship/build-utils';

const _package = JSON.parse(_fs.readFileSync('./package.json', 'utf-8'));
const project = new Project(_package);
const projectInfo = `${_colors.cyan.bold(project.name)} (${_colors.blue(
    project.type
)} - ${_colors.green(project.language)})`;

_log.info(`Initializing tasks for project: ${projectInfo}`);
const factory = getTaskFactory(project);
factory.createTasks().forEach((task) => _gulp.task(task));
