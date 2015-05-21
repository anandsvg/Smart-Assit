/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function(config) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';

	config.toolbar = [{
		name: 'basicstyles',
		groups: ['basicstyles', 'cleanup'],
		items: ['Bold', 'Italic', 'Underline', 'Strike', '-', 'RemoveFormat']
	}, {
		name: 'paragraph',
		groups: ['list', 'indent', 'blocks', 'align', 'bidi'],
		items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']
	}, {
		name: 'links',
		items: ['Link', 'Unlink', 'Anchor']
	}, {
		name: 'insert',
		items: ['HorizontalRule']
	}, {
		name: 'clipboard',
		groups: ['clipboard', 'undo'],
		items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo']
	}, {
		name: 'editing',
		groups: ['find', 'selection', 'spellchecker'],
		items: ['Scayt']
	}, '/', {
		name: 'styles',
		items: ['Format', 'FontSize']
	}, {
		name: 'colors',
		items: ['TextColor', 'BGColor']
	}];

	// Toolbar groups configuration.
	config.toolbarGroups = [{
			name: 'clipboard',
			groups: ['clipboard', 'undo']
		}, {
			name: 'editing',
			groups: ['find', 'selection', 'spellchecker']
		}, {
			name: 'forms'
		},
		'/', {
			name: 'basicstyles',
			groups: ['basicstyles', 'cleanup']
		}, {
			name: 'paragraph',
			groups: ['list', 'indent', 'blocks', 'align', 'bidi']
		}, {
			name: 'links'
		}, {
			name: 'insert'
		},
		'/', {
			name: 'styles'
		}, {
			name: 'colors'
		}, {
			name: 'tools'
		}, {
			name: 'others'
		}, {
			name: 'about'
		}
	];

	config.removePlugins = 'elementspath';
};