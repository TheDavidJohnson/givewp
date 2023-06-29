<?php

namespace Give\PaymentGateways\Gateways\Stripe\Migrations;

use Give\Framework\Database\DB;
use Give\Framework\Migrations\Contracts\Migration;

/**
 * Removes the secret meta that was unnecessarily stored in the database for donations.
 *
 * @unreleased
 */
class RemovePaymentIntentSecretMeta extends Migration
{
    /**
     * @inheritDoc
     */
    public static function id(): string
    {
        return 'remove_payment_intent_secret_meta';
    }

    /**
     * @inheritDoc
     */
    public static function title(): string
    {
        return __('Remove payment intent secret meta', 'give');
    }

    /**
     * @inheritDoc
     */
    public static function timestamp()
    {
        return strtotime('2020-08-20 00:00:00');
    }

    /**
     * @inheritDoc
     */
    public function run()
    {
        DB::delete(
            DB::prefix('give_donationmeta'),
            ['meta_key' => '_give_stripe_payment_intent_client_secret'],
            ['%s']
        );
    }
}
