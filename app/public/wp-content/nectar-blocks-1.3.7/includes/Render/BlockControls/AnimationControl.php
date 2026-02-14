<?php

namespace Nectar\Render\BlockControls;

use Nectar\Utilities\Log;

class AnimationControl implements BlockControlBase {
  public static function get_conditional_js($attributes): array {
    Log::debug(json_encode($attributes));
    return [];
  }
}