DROP TABLE IF EXISTS `repositories`;
DROP TABLE IF EXISTS `tags`;

CREATE TABLE `repositories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `owner` VARCHAR(128) NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`owner`, `name`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE `tags` (
  `name` VARCHAR(128) NOT NULL,
  `repository_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY (`name`, `repository_id`),
  FOREIGN KEY (`repository_id`) REFERENCES `repositories` (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;
