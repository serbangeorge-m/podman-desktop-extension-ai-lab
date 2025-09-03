/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/
import { type Locator, type Page, expect as playExpect } from '@playwright/test';
import { AILabBasePage } from './ai-lab-base-page';

export class AiLlamaStackPage extends AILabBasePage {
  readonly startLlamaStackContainerButton: Locator;
  readonly openLlamaStackContainerButton: Locator;
  readonly exploreLlamaStackEnvironmentButton: Locator;
  readonly allTaskItems: Locator;
  private readonly completedTaskIcon: Locator;
  private readonly startingLlamaStackPlaygroundTask: Locator;

  constructor(page: Page, webview: Page) {
    super(page, webview, 'Llama Stack');
    this.startLlamaStackContainerButton = this.webview.getByRole('button', { name: 'Start Llama Stack container' });
    this.openLlamaStackContainerButton = this.webview.getByRole('button', { name: 'Open Llama Stack container' });
    this.exploreLlamaStackEnvironmentButton = this.webview.getByRole('button', {
      name: 'Explore Llama-Stack environment',
    });
    this.allTaskItems = this.webview.locator('ul.space-y-2 > li');
    this.startingLlamaStackPlaygroundTask = this.allTaskItems.filter({
      has: this.webview.getByText('Starting Llama Stack Playground'),
    });
    this.completedTaskIcon = this.startingLlamaStackPlaygroundTask.locator('svg.text-green-500');
  }

  async waitForLoad(): Promise<void> {
    await this.startLlamaStackContainerButton.waitFor({ state: 'visible' });
  }

  async runLlamaStackContainer(): Promise<void> {
    await this.startLlamaStackContainerButton.click();
  }

  async waitForOpenLlamaStackContainerButton(): Promise<void> {
    await this.openLlamaStackContainerButton.waitFor({ state: 'visible' });
  }

  async waitForExploreLlamaStackEnvironmentButton(): Promise<void> {
    await this.exploreLlamaStackEnvironmentButton.waitFor({ state: 'visible' });
  }

  async verifyTasksCompletedSuccessfully(): Promise<void> {
    await this.startingLlamaStackPlaygroundTask.waitFor({ state: 'visible', timeout: 360_000 });
    await this.completedTaskIcon.waitFor({ state: 'visible', timeout: 10_000 });
  }

  async waitForLlamaStackContainerToStart(): Promise<void> {
    await playExpect
      .poll(
        async () => {
          const isIconVisible = await this.completedTaskIcon.isVisible();
          const isButtonVisible = await this.openLlamaStackContainerButton.isVisible();
          const hasError = await this.webview.getByText('error').isVisible();
          if (hasError) {
            console.error('An error was detected in the Llama Stack tasks. The test will fail.');
            return true;
          }
          return isIconVisible || isButtonVisible;
        },
        {
          message: 'Expected a successful start task or "Open" button to become visible.',
          timeout: 360_000,
          intervals: [5_000],
        },
      )
      .toBeTruthy();
  }
}
