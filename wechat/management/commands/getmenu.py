# -*- coding: utf-8 -*-
#
import logging

from django.utils import timezone
from django.core.management.base import BaseCommand, CommandError

from wechat.views import CustomWeChatView
from wechat.models import Activity


__author__ = "Epsirom"


class Command(BaseCommand):
    help = 'Query WeChat menu'

    logger = logging.getLogger('getmenu')

    def handle(self, *args, **options):
        current_menu = CustomWeChatView.lib.get_wechat_menu()
        self.logger.info('Got menu: %s', current_menu)

        existed_buttons = list()
        for btn in current_menu:
            if btn['name'] == '抢票':
                existed_buttons += btn.get('sub_button', list())

        self.logger.info('Got %d activities', len(existed_buttons))
        self.logger.info('=' * 32)
        for idx, act in enumerate(existed_buttons):
            self.logger.info('%d. %s (%s)', idx, act.get('name', ''), act.get('key', ''))


Command.logger.setLevel(logging.DEBUG)
