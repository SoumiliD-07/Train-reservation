#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_SEATS 10

// Passenger Node for Linked List
typedef struct Node {
int PNR;
char name[50];
int age;
char gender[10];
int seatNumber;
struct Node* next;
} Node;

// Queue Node for Waiting List
typedef struct QueueNode {
int PNR;
char name[50];
int age;
char gender[10];
struct QueueNode* next;
} QueueNode;

// Queue Structure
typedef struct Queue {
QueueNode* front;
QueueNode* rear;
} Queue;

// Global Data Structures
int seats[MAX_SEATS] = {0}; // Array: 0 = Available, 1 = Booked
Node* head = NULL;          // Linked List Head for Booked Tickets
Queue waitingList;          // FIFO Queue for Waiting List
int globalPNR = 1001;

// Function Prototypes
void initQueue(Queue* q);
void bookTicket(char name[], int age, char gender[]);
void cancelTicket(int pnr);
void enqueue(Queue* q, int pnr, char name[], int age, char gender[]);
QueueNode* dequeue(Queue* q);
void displayBookings();
void displayWaitingList();
int getAvailableSeat();

int main() {
initQueue(&waitingList);
printf("=== TRAIN RESERVATION SYSTEM (C IMPL) ===\n");

// Example Operations
bookTicket("Alice Smith", 29, "Female");
bookTicket("Bob Jones", 34, "Male");
displayBookings();

return 0;


}

void initQueue(Queue* q) {
q->front = q->rear = NULL;
}

int getAvailableSeat() {
for (int i = 0; i < MAX_SEATS; i++) {
if (seats[i] == 0) return i + 1; // 1-indexed seats
}
return -1; // No seats available
}

void bookTicket(char name[], int age, char gender[]) {
int seatNo = getAvailableSeat();

if (seatNo != -1) {
    // Seat Available -> Add to Linked List & Mark Array
    seats[seatNo - 1] = 1;
    Node* newNode = (Node*)malloc(sizeof(Node));
    newNode->PNR = globalPNR++;
    strcpy(newNode->name, name);
    newNode->age = age;
    strcpy(newNode->gender, gender);
    newNode->seatNumber = seatNo;
    newNode->next = head;
    head = newNode;
    printf("[CONFIRMED] Booked PNR %d for %s on Seat %d\n", newNode->PNR, name, seatNo);
} else {
    // Seats Full -> Push to FIFO Queue
    enqueue(&waitingList, globalPNR++, name, age, gender);
    printf("[WAITING LIST] Train Full. Added %s to Waiting Queue.\n", name);
}


}

void cancelTicket(int pnr) {
Node *temp = head, *prev = NULL;

while (temp != NULL && temp->PNR != pnr) {
    prev = temp;
    temp = temp->next;
}

if (temp == NULL) {
    printf("[ERROR] PNR %d not found in confirmed list.\n", pnr);
    return;
}

// Free seat in Array
int freedSeat = temp->seatNumber;
seats[freedSeat - 1] = 0;

// Unlink node from Linked List
if (prev == NULL) head = temp->next;
else prev->next = temp->next;

printf("[CANCELLED] PNR %d cancelled. Seat %d freed.\n", pnr, freedSeat);
free(temp);

// Promote first person from Waiting Queue (FIFO)
QueueNode* promoted = dequeue(&waitingList);
if (promoted != NULL) {
    seats[freedSeat - 1] = 1;
    Node* newNode = (Node*)malloc(sizeof(Node));
    newNode->PNR = promoted->PNR;
    strcpy(newNode->name, promoted->name);
    newNode->age = promoted->age;
    strcpy(newNode->gender, promoted->gender);
    newNode->seatNumber = freedSeat;
    newNode->next = head;
    head = newNode;
    printf("[PROMOTED] Waiting List Passenger %s auto-assigned Seat %d (PNR %d)\n", 
           promoted->name, freedSeat, promoted->PNR);
    free(promoted);
}


}

void enqueue(Queue* q, int pnr, char name[], int age, char gender[]) {
QueueNode* newNode = (QueueNode*)malloc(sizeof(QueueNode));
newNode->PNR = pnr;
strcpy(newNode->name, name);
newNode->age = age;
strcpy(newNode->gender, gender);
newNode->next = NULL;

if (q->rear == NULL) {
    q->front = q->rear = newNode;
    return;
}
q->rear->next = newNode;
q->rear = newNode;


}

QueueNode* dequeue(Queue* q) {
if (q->front == NULL) return NULL;
QueueNode* temp = q->front;
q->front = q->front->next;
if (q->front == NULL) q->rear = NULL;
return temp;
}