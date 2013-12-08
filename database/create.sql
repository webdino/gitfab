DROP TABLE IF EXISTS `forks`;
DROP TABLE IF EXISTS `tags`;
DROP TABLE IF EXISTS `repositories`;

CREATE TABLE `repositories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `owner` VARCHAR(128) NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  `branch` varchar(128) NOT NULL DEFAULT 'master',
  `avatar` VARCHAR(200) ,
  `thumbnail` VARCHAR(200) ,
  `aspect` FLOAT UNSIGNED,
  `created` DATETIME NOT NULL,
  `updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`owner`, `name`, `branch`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE `tags` (
  `name` VARCHAR(128) NOT NULL,
  `repository_id` INT UNSIGNED NOT NULL,
  UNIQUE KEY (`name`, `repository_id`),
  FOREIGN KEY (`repository_id`) REFERENCES `repositories` (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE `forks` (
  `parent_id` INT UNSIGNED NOT NULL,
  `child_id` INT UNSIGNED NOT NULL,
  UNIQUE KEY (`parent_id`, `child_id`),
  FOREIGN KEY (`parent_id`) REFERENCES `repositories` (`id`),
  FOREIGN KEY (`child_id`) REFERENCES `repositories` (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

