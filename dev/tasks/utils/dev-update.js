/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const tools = require( './tools' );
const git = require( './git' );
const path = require( 'path' );

/**
 * 1. Get CKEditor5 dependencies from package.json file.
 * 2. Scan workspace for repositories that match dependencies from package.json file.
 * 3. Run GIT pull command on each repository found.
 *
 * @param {String} ckeditor5Path Path to main CKEditor5 repository.
 * @param {Object} packageJSON Parsed package.json file from CKEditor5 repository.
 * @param {String} workspaceRoot Relative path to workspace root.
 * @param {Function} writeln Function for log output.
 * @param {Function} writeError Function of error output
 */
module.exports = ( ckeditor5Path, packageJSON, workspaceRoot, writeln, writeError ) => {
	const workspaceAbsolutePath = path.join( ckeditor5Path, workspaceRoot );

	// Get all CKEditor dependencies from package.json.
	const dependencies = tools.getCKEditorDependencies( packageJSON.dependencies );

	if ( dependencies ) {
		const directories = tools.getCKE5Directories( workspaceAbsolutePath );

		for ( let dependency in dependencies ) {
			const repositoryURL = dependencies[ dependency ];
			const urlInfo = git.parseRepositoryUrl( repositoryURL );
			const repositoryAbsolutePath = path.join( workspaceAbsolutePath, dependency );

			// Check if repository's directory already exists.
			if ( directories.indexOf( dependency ) > -1 ) {
				try {
					writeln( `Updating ${ repositoryURL }...` );
					git.pull( repositoryAbsolutePath, urlInfo.branch );
				} catch ( error ) {
					writeError( error );
				}
			}
		}
	} else {
		writeln( 'No CKEditor5 dependencies found in package.json file.' );
	}
};
