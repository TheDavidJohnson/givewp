<?php

namespace Give\Log;

use Give\Helpers\Hooks;
use Give\Log\Helpers\LegacyLogsTable;
use Give\ServiceProviders\ServiceProvider;
use Give\Framework\Migrations\MigrationsRegister;
use Give\Log\Migrations\CreateNewLogTable;
use Give\Log\Migrations\MigrateExistingLogs;
use Give\Log\Migrations\DeleteOldLogTables;
use Give\Log\Helpers\Environment;

/**
 * Class LogServiceProvider
 * @package Give\Log
 *
 * @since 2.10.0
 */
class LogServiceProvider implements ServiceProvider {
	/**
	 * @inheritdoc
	 */
	public function register() {
		global $wpdb;

		$wpdb->give_log = "{$wpdb->prefix}give_log";

		give()->singleton( LogRepository::class );
	}

	/**
	 * @inheritdoc
	 */
	public function boot() {
		$this->registerMigrations();

		Hooks::addAction( 'give_register_updates', MigrateExistingLogs::class, 'register' );

		// Hook up
		if ( Environment::isLogsPage() ) {
			Hooks::addAction( 'admin_enqueue_scripts', Assets::class, 'enqueueScripts' );
		}
	}

	/**
	 * Register migration
	 */
	private function registerMigrations() {
		give( MigrationsRegister::class )->addMigration( CreateNewLogTable::class );

		$legacyLogsTable = give( LegacyLogsTable::class );

		// Check if legacy table exist
		if ( $legacyLogsTable->exist() ) {
			give( MigrationsRegister::class )->addMigration( MigrateExistingLogs::class );

			// Check if Logs migration batch processing is completed
			if ( give_has_upgrade_completed( MigrateExistingLogs::id() ) ) {
				give( MigrationsRegister::class )->addMigration( DeleteOldLogTables::class );
			}
		}
	}
}
