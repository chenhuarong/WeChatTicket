from django.utils import timezone

from wechat.wrapper import WeChatView, WeChatLib
from wechat.handlers import *
from wechat.models import Activity
from WeChatTicket.settings import WECHAT_TOKEN, WECHAT_APPID, WECHAT_SECRET


class CustomWeChatView(WeChatView):

    lib = WeChatLib(WECHAT_TOKEN, WECHAT_APPID, WECHAT_SECRET)

    handlers = [
        HelpOrSubscribeHandler, UnbindOrUnsubscribeHandler, BindAccountHandler, BookEmptyHandler,
    ]
    error_message_handler = ErrorHandler
    default_handler = DefaultHandler

    event_keys = {
        'book_what': 'SERVICE_BOOK_WHAT',
        'get_ticket': 'SERVICE_GET_TICKET',
        'account_bind': 'SERVICE_BIND',
        'help': 'SERVICE_HELP',
        'book_empty': 'BOOKING_EMPTY',
        'book_header': 'BOOKING_ACTIVITY_',
    }

    menu = {
        'button': [
            {
                "name": "服务",
                "sub_button": [
                    {
                        "type": "click",
                        "name": "抢啥",
                        "key": event_keys['book_what'],
                    },
                    {
                        "type": "click",
                        "name": "查票",
                        "key": event_keys['get_ticket'],
                    },
                    {
                        "type": "click",
                        "name": "绑定",
                        "key": event_keys['account_bind'],
                    },
                    {
                        "type": "click",
                        "name": "帮助",
                        "key": event_keys['help'],
                    }
                ]
            },
            {
                "name": "抢票",
                "sub_button": []
            }
        ]
    }

    @classmethod
    def get_book_btn(cls):
        return cls.menu['button'][-1]

    @classmethod
    def update_book_button(cls, activities):
        book_btn = cls.get_book_btn()
        if len(activities) == 0:
            book_btn['type'] = 'click'
            book_btn['key'] = cls.event_keys['book_empty']
        else:
            book_btn.pop('type', None)
            book_btn.pop('key', None)
        book_btn['sub_button'] = list()
        for act in activities:
            book_btn['sub_button'].append({
                'type': 'click',
                'name': act['name'],
                'key': cls.event_keys['book_header'] + str(act['id']),
            })

    @classmethod
    def update_menu(cls, activities=None):
        """
        :param activities: list of Activity
        :return: None
        """
        if activities is not None:
            if len(activities) > 5:
                cls.logger.warn('Custom menu with %d activities, keep only 5', len(activities))
            cls.update_book_button([{'id': act.id, 'name': act.name} for act in activities[:5]])
        else:
            current_menu = cls.lib.get_wechat_menu()
            existed_buttons = list()
            for btn in current_menu:
                if btn['name'] == '抢票':
                    existed_buttons += btn.get('sub_button', list())
            activity_ids = list()
            for btn in existed_buttons:
                if 'key' in btn:
                    activity_id = btn['key']
                    if activity_id.startswith(cls.event_keys['book_header']):
                        activity_id = activity_id[len(cls.event_keys['book_header']):]
                    if activity_id and activity_id.isdigit():
                        activity_ids.append(int(activity_id))
            return cls.update_menu(Activity.objects.filter(
                id__in=activity_ids, status=Activity.STATUS_PUBLISHED, book_end__gt=timezone.now()
            ).order_by('book_end')[: 5])
        cls.lib.set_wechat_menu(cls.menu)
