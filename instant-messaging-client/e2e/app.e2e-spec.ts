import { InstantMessagingClientPage } from './app.po';

describe('instant-messaging-client App', () => {
  let page: InstantMessagingClientPage;

  beforeEach(() => {
    page = new InstantMessagingClientPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
