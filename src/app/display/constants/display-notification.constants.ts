import { NOTIFICATION } from '../model/notification.constatnts';

export const DISPLAY_NOTIFICATION_SERVICE = {
  DROP_MSG_SUCCESS: {
    msg: 'Drop Success',
    type: NOTIFICATION.SUCCESS
  },

  Module_Save_Success: {
    msg: 'Module saved succesfully!!',
    type: NOTIFICATION.SUCCESS
  },

  Module_Save_UniqueError: {
    msg: 'Module Name & Version in not unique',
    type: NOTIFICATION.ERROR
  }

};


