# -*- coding: utf-8 -*-
#
import logging

from django.utils import timezone
from django.core.management.base import BaseCommand, CommandError

from wechat.views import CustomWeChatView
from wechat.models import Activity


__author__ = "Epsirom"


class Command(BaseCommand):
    help = 'Automatically synchronize WeChat menu'

    logger = logging.getLogger('syncmenu')

    def handle(self, *args, **options):
        CustomWeChatView.update_menu(Activity.objects.filter(
            status=Activity.STATUS_PUBLISHED, book_end__gt=timezone.now()
        ).order_by('book_end'))
        act_btns = CustomWeChatView.get_book_btn().get('sub_button', list())
        self.logger.info('Updated %d activities', len(act_btns))
        self.logger.info('=' * 32)
        for idx, act in enumerate(act_btns):
            self.logger.info('%d. %s (%s)', idx, act.get('name', ''), act.get('key', ''))


Command.logger.setLevel(logging.DEBUG)
